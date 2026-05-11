//go:build ignore

// 批量加密渠道密钥迁移脚本
// 将数据库中存量的明文渠道密钥一次性加密为 AES-256-GCM 格式
//
// 使用方法：
//   cd /path/to/new-api
//   go run scripts/migrate_encrypt_keys.go
//
// 注意：
//   - 运行前必须确保 .env 中 SESSION_SECRET 已固定，且与生产环境一致
//   - 此脚本幂等，可重复运行，已加密的密钥不会被二次加密
//   - 建议在低峰期执行，并提前备份数据库

package main

import (
	"crypto/aes"
	"crypto/cipher"
	crand "crypto/rand"
	"crypto/sha256"
	"encoding/base64"
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

const EncryptedPrefix = "ENC:"

func main() {
	// 加载 .env
	if err := godotenv.Load(".env"); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	cryptoSecret := os.Getenv("SESSION_SECRET")
	if cryptoSecret == "" {
		log.Fatal("SESSION_SECRET is not set! Please configure it in .env first.")
	}
	fmt.Printf("Using SESSION_SECRET (first 8 chars): %s...\n", cryptoSecret[:8])

	// 连接数据库
	db := connectDB()
	if db == nil {
		log.Fatal("Failed to connect to database")
	}
	fmt.Println("Connected to database successfully")

	// 查询所有渠道的 id 和 key
	type ChannelRow struct {
		Id  int
		Key string
	}
	var channels []ChannelRow
	if err := db.Raw("SELECT id, key FROM channels").Scan(&channels).Error; err != nil {
		log.Fatalf("Failed to query channels: %v", err)
	}
	fmt.Printf("Found %d channels total\n", len(channels))

	// 统计
	skipped := 0
	encrypted := 0
	failed := 0

	for _, ch := range channels {
		if ch.Key == "" {
			skipped++
			continue
		}
		// 已经加密，跳过
		if strings.HasPrefix(ch.Key, EncryptedPrefix) {
			skipped++
			continue
		}

		// 加密明文密钥
		encKey, err := encryptAES(ch.Key, cryptoSecret)
		if err != nil {
			log.Printf("[ERROR] Channel %d: encryption failed: %v", ch.Id, err)
			failed++
			continue
		}

		// 直接用 SQL 更新，绕过 GORM Hook（避免 AfterFind 解密后再 BeforeSave 二次加密的问题）
		if err := db.Exec("UPDATE channels SET key = ? WHERE id = ?", encKey, ch.Id).Error; err != nil {
			log.Printf("[ERROR] Channel %d: database update failed: %v", ch.Id, err)
			failed++
			continue
		}

		fmt.Printf("[OK] Channel %d: encrypted (key prefix: %s...)\n", ch.Id, ch.Key[:min(8, len(ch.Key))])
		encrypted++
	}

	fmt.Println("\n============================")
	fmt.Printf("Migration complete!\n")
	fmt.Printf("  Encrypted: %d\n", encrypted)
	fmt.Printf("  Skipped (already encrypted or empty): %d\n", skipped)
	fmt.Printf("  Failed: %d\n", failed)
	fmt.Println("============================")

	if failed > 0 {
		os.Exit(1)
	}
}

func encryptAES(plaintext, secret string) (string, error) {
	keyHash := sha256.Sum256([]byte(secret))
	block, err := aes.NewCipher(keyHash[:])
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := crand.Read(nonce); err != nil {
		return "", err
	}
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return EncryptedPrefix + base64.StdEncoding.EncodeToString(ciphertext), nil
}

func connectDB() *gorm.DB {
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	}

	dsn := os.Getenv("SQL_DSN")
	if dsn == "" {
		log.Fatal("SQL_DSN is not set! Please set it to your database connection string.")
	}

	var dialector gorm.Dialector
	switch {
	case strings.HasPrefix(dsn, "postgres"), strings.HasPrefix(dsn, "postgresql"):
		dialector = postgres.Open(dsn)
	default:
		// MySQL/TiDB
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
