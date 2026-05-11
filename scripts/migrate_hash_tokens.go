//go:build ignore

// migrate_hash_tokens.go — 存量 Token 和 AccessToken 哈希化迁移脚本
//
// 功能：
//   将数据库中明文存储的 tokens.key 和 users.access_token
//   迁移为 HMAC-SHA256 哈希格式，同时填充 tokens.key_hint 字段。
//
// 使用方法：
//   cd /path/to/new-api
//   go run scripts/migrate_hash_tokens.go
//
// ⚠️ 注意事项：
//   1. 运行前确保 SESSION_SECRET 已固定（与生产环境一致）
//   2. 此脚本幂等：已是 64 字节 hex 的值会被判定为已迁移，跳过
//   3. 迁移后，用户的现有 Token 仍然可用（只是 DB 存 hash，验证时计算 hash 比对）
//   4. 迁移后，用户的 AccessToken 必须重新生成（无法从 hash 反推明文）
//   5. 强烈建议在低峰期执行，并提前备份数据库

package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func hmacSHA256(data, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

func buildKeyHint(key string) string {
	if len(key) < 8 {
		return strings.Repeat("*", len(key))
	}
	return key[:4] + "***" + key[len(key)-4:]
}

// isLikelyHash 判断是否已经是 64 字符 hex（已迁移）
func isLikelyHash(s string) bool {
	if len(s) != 64 {
		return false
	}
	for _, c := range s {
		if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')) {
			return false
		}
	}
	return true
}

func main() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cryptoSecret := os.Getenv("SESSION_SECRET")
	if cryptoSecret == "" {
		log.Fatal("SESSION_SECRET is not set! Please configure it in .env first.")
	}
	fmt.Printf("Using SESSION_SECRET (first 8 chars): %s...\n", cryptoSecret[:8])

	db := connectDB()
	fmt.Println("Connected to database successfully")

	migrateTokens(db, cryptoSecret)
	migrateAccessTokens(db, cryptoSecret)
}

func migrateTokens(db *gorm.DB, secret string) {
	fmt.Println("\n=== Migrating tokens.key ===")

	// 确保 key_hint 列存在（PostgreSQL）
	db.Exec(`ALTER TABLE tokens ADD COLUMN IF NOT EXISTS key_hint VARCHAR(20) NOT NULL DEFAULT ''`)
	// 确保 key 列宽度足够（从 char(48) 拙宽到 varchar(64)）
	db.Exec(`ALTER TABLE tokens ALTER COLUMN key TYPE VARCHAR(64)`)

	type TokenRow struct {
		Id      int
		Key     string
		KeyHint string `gorm:"column:key_hint"`
	}

	var tokens []TokenRow
	if err := db.Raw("SELECT id, key, key_hint FROM tokens WHERE deleted_at IS NULL").Scan(&tokens).Error; err != nil {
		log.Fatalf("Failed to query tokens: %v", err)
	}
	fmt.Printf("Found %d tokens\n", len(tokens))

	skipped, migrated, failed := 0, 0, 0

	for _, t := range tokens {
		// 已迁移（64 字节 hex）则跳过
		if isLikelyHash(t.Key) {
			skipped++
			continue
		}

		keyHash := hmacSHA256(t.Key, secret)
		keyHint := buildKeyHint(t.Key)

		if err := db.Exec("UPDATE tokens SET key = ?, key_hint = ? WHERE id = ?", keyHash, keyHint, t.Id).Error; err != nil {
			log.Printf("[ERROR] Token %d: update failed: %v", t.Id, err)
			failed++
			continue
		}
		fmt.Printf("[OK] Token %d: %s... → hash\n", t.Id, t.Key[:min(8, len(t.Key))])
		migrated++
	}

	fmt.Printf("Tokens — migrated: %d, skipped: %d, failed: %d\n", migrated, skipped, failed)
	if failed > 0 {
		log.Printf("WARNING: %d tokens failed to migrate", failed)
	}
}

func migrateAccessTokens(db *gorm.DB, secret string) {
	fmt.Println("\n=== Migrating users.access_token ===")

	// 确保 access_token 列宽度足够（从 char(32) 拙宽到 varchar(64)）
	db.Exec(`ALTER TABLE users ALTER COLUMN access_token TYPE VARCHAR(64)`)

	type UserRow struct {
		Id          int
		AccessToken *string `gorm:"column:access_token"`
	}

	var users []UserRow
	if err := db.Raw("SELECT id, access_token FROM users WHERE access_token IS NOT NULL AND access_token != '' AND deleted_at IS NULL").Scan(&users).Error; err != nil {
		log.Fatalf("Failed to query users: %v", err)
	}
	fmt.Printf("Found %d users with access_token\n", len(users))

	skipped, migrated, failed := 0, 0, 0

	for _, u := range users {
		if u.AccessToken == nil || *u.AccessToken == "" {
			skipped++
			continue
		}
		// 已迁移则跳过
		if isLikelyHash(*u.AccessToken) {
			skipped++
			continue
		}

		tokenHash := hmacSHA256(*u.AccessToken, secret)

		if err := db.Exec("UPDATE users SET access_token = ? WHERE id = ?", tokenHash, u.Id).Error; err != nil {
			log.Printf("[ERROR] User %d: update failed: %v", u.Id, err)
			failed++
			continue
		}
		fmt.Printf("[OK] User %d: access_token migrated to hash\n", u.Id)
		migrated++
	}

	fmt.Printf("AccessTokens — migrated: %d, skipped: %d, failed: %d\n", migrated, skipped, failed)
	if failed > 0 {
		log.Printf("WARNING: %d access_tokens failed to migrate", failed)
	}

	if migrated > 0 {
		fmt.Println()
		fmt.Println("⚠️  AccessToken 迁移说明：")
		fmt.Println("   已迁移的 AccessToken 无法从哈希反推明文。")
		fmt.Println("   受影响用户需要重新生成 AccessToken（控制台 → 个人设置 → 重新生成）。")
	}
}

func connectDB() *gorm.DB {
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	}

	dsn := os.Getenv("SQL_DSN")
	if dsn == "" {
		log.Fatal("SQL_DSN is not set!")
	}

	var dialector gorm.Dialector
	switch {
	case strings.HasPrefix(dsn, "postgres"), strings.HasPrefix(dsn, "postgresql"):
		dialector = postgres.Open(dsn)
	default:
		dialector = mysql.Open(dsn)
	}

	db, err := gorm.Open(dialector, gormConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	return db
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
