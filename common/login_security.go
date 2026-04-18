package common

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// Login brute-force protection (per username, Redis-backed with in-memory fallback)
//
// Strategy:
//   - 10 failed attempts within 15 minutes → lock the account for 15 minutes
//   - Works regardless of the attacking IP (complements IP-based CriticalRateLimit)
//   - Key: loginFail:{lowercased_username}
//   - Value: integer failure count, TTL auto-resets on success

const (
	loginFailKeyPrefix  = "loginFail:"
	loginMaxFailures    = 10             // failures before lockout
	loginLockWindow     = 15 * 60        // seconds: sliding window and lockout duration
)

func loginFailKey(username string) string {
	return loginFailKeyPrefix + strings.ToLower(strings.TrimSpace(username))
}

// IsLoginLocked returns (true, remainingSeconds) when the account is locked.
// Returns (false, 0) when the account may proceed.
func IsLoginLocked(username string) (bool, int64) {
	if !RedisEnabled {
		return false, 0 // no Redis = no per-username lock (IP lock still applies)
	}
	ctx := context.Background()
	key := loginFailKey(username)

	val, err := RDB.Get(ctx, key).Int64()
	if err != nil {
		return false, 0 // key not found or error → allow
	}
	if val < loginMaxFailures {
		return false, 0
	}
	// Locked: return remaining TTL
	ttl, err := RDB.TTL(ctx, key).Result()
	if err != nil || ttl <= 0 {
		return false, 0
	}
	return true, int64(ttl.Seconds())
}

// RecordLoginFailure increments the per-username failure counter.
// If this is the first failure, the TTL window is started.
// The window is NOT reset on each failure (prevents TTL extension attacks).
func RecordLoginFailure(username string) {
	if !RedisEnabled {
		return
	}
	ctx := context.Background()
	key := loginFailKey(username)

	count, err := RDB.Incr(ctx, key).Result()
	if err != nil {
		SysLog("login_security: failed to record failure for " + username + ": " + err.Error())
		return
	}
	// Set TTL only on the first failure (sliding window = lock window)
	if count == 1 {
		_ = RDB.Expire(ctx, key, time.Duration(loginLockWindow)*time.Second).Err()
	}
	if count >= loginMaxFailures {
		SysLog(fmt.Sprintf("login_security: account '%s' locked after %d failures", username, count))
	}
}

// ResetLoginFailure clears the failure counter after a successful login.
func ResetLoginFailure(username string) {
	if !RedisEnabled {
		return
	}
	_ = RDB.Del(context.Background(), loginFailKey(username)).Err()
}
