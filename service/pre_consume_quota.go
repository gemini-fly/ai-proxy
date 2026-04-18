package service

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/QuantumNous/new-api/types"

	"github.com/bytedance/gopkg/util/gopool"
	"github.com/gin-gonic/gin"
)

// ── Inflight request tracking (crash-safe quota protection) ─────────────────
// When a node crashes mid-stream, pre-consumed quota would be stuck forever.
// We write a Redis record before deducting quota and clear it on normal finish.
// On startup, any leftover records trigger automatic refunds.

const (
	inflightKeyPrefix = "inflight:"
	inflightTTL       = 15 * time.Minute // max expected AI call duration
)

func inflightKey(requestId string) string {
	return inflightKeyPrefix + requestId
}

// registerInflightRequest writes userId|preConsumedQuota|tokenId|tokenKey|isPlayground to Redis.
func registerInflightRequest(requestId string, userId, preConsumedQuota, tokenId int, tokenKey string, isPlayground bool) {
	if !common.RedisEnabled || requestId == "" || preConsumedQuota <= 0 {
		return
	}
	val := fmt.Sprintf("%d|%d|%d|%s|%t", userId, preConsumedQuota, tokenId, tokenKey, isPlayground)
	if err := common.RedisSet(inflightKey(requestId), val, inflightTTL); err != nil {
		common.SysLog("inflight: failed to register request " + requestId + ": " + err.Error())
	}
}

// ClearInflightRequest removes the inflight record when the request finishes normally.
func ClearInflightRequest(requestId string) {
	if !common.RedisEnabled || requestId == "" {
		return
	}
	_ = common.RedisDel(inflightKey(requestId))
}

// RefundOrphanedInflightQuota scans Redis for leftover inflight records (from crashed nodes)
// and refunds the pre-consumed quota back to the user and token.
// Should be called once at startup after Redis is initialised.
func RefundOrphanedInflightQuota() {
	if !common.RedisEnabled {
		return
	}
	keys, err := common.RedisScan(inflightKeyPrefix + "*")
	if err != nil {
		common.SysLog("inflight: scan failed: " + err.Error())
		return
	}
	if len(keys) == 0 {
		return
	}
	common.SysLog(fmt.Sprintf("inflight: found %d orphaned records, starting refund...", len(keys)))
	refunded := 0
	for _, key := range keys {
		val, err := common.RedisGet(key)
		if err != nil {
			continue
		}
		parts := strings.SplitN(val, "|", 5)
		if len(parts) != 5 {
			common.SysLog("inflight: skipping malformed record: " + key)
			_ = common.RedisDel(key)
			continue
		}
		userId, err1 := strconv.Atoi(parts[0])
		preConsumedQuota, err2 := strconv.Atoi(parts[1])
		tokenId, err3 := strconv.Atoi(parts[2])
		tokenKey := parts[3]
		isPlayground := parts[4] == "true"
		if err1 != nil || err2 != nil || err3 != nil || preConsumedQuota <= 0 {
			common.SysLog("inflight: skipping invalid record: " + key)
			_ = common.RedisDel(key)
			continue
		}

		// Build minimal RelayInfo to reuse PostConsumeQuota (handles both user + token quota)
		minInfo := &relaycommon.RelayInfo{
			UserId:       userId,
			TokenId:      tokenId,
			TokenKey:     tokenKey,
			IsPlayground: isPlayground,
		}
		// Return the pre-consumed quota (negative delta = credit back)
		if refundErr := PostConsumeQuota(minInfo, -preConsumedQuota, 0, false); refundErr != nil {
			common.SysLog(fmt.Sprintf("inflight: refund failed for userId %d quota %d: %s", userId, preConsumedQuota, refundErr.Error()))
			continue
		}
		_ = common.RedisDel(key)
		common.SysLog(fmt.Sprintf("inflight: refunded userId %d pre-consumed quota %d (token %d)", userId, preConsumedQuota, tokenId))
		refunded++
	}
	if refunded > 0 {
		common.SysLog(fmt.Sprintf("inflight: refund complete, %d/%d records processed", refunded, len(keys)))
	}
}

// ── Original quota functions ─────────────────────────────────────────────────

func ReturnPreConsumedQuota(c *gin.Context, relayInfo *relaycommon.RelayInfo) {
	if relayInfo.FinalPreConsumedQuota != 0 {
		requestId := c.GetString(common.RequestIdKey)
		ClearInflightRequest(requestId) // clear before async refund
		logger.LogInfo(c, fmt.Sprintf("用户 %d 请求失败, 返还预扣费额度 %s", relayInfo.UserId, logger.FormatQuota(relayInfo.FinalPreConsumedQuota)))
		gopool.Go(func() {
			relayInfoCopy := *relayInfo

			err := PostConsumeQuota(&relayInfoCopy, -relayInfoCopy.FinalPreConsumedQuota, 0, false)
			if err != nil {
				common.SysLog("error return pre-consumed quota: " + err.Error())
			}
		})
	}
}

// PreConsumeQuota checks if the user has enough quota to pre-consume.
// It returns the pre-consumed quota if successful, or an error if not.
func PreConsumeQuota(c *gin.Context, preConsumedQuota int, relayInfo *relaycommon.RelayInfo) *types.NewAPIError {
	userQuota, err := model.GetUserQuota(relayInfo.UserId, false)
	if err != nil {
		return types.NewError(err, types.ErrorCodeQueryDataError, types.ErrOptionWithSkipRetry())
	}
	if userQuota <= 0 {
		return types.NewErrorWithStatusCode(fmt.Errorf("用户额度不足, 剩余额度: %s", logger.FormatQuota(userQuota)), types.ErrorCodeInsufficientUserQuota, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
	}
	if userQuota-preConsumedQuota < 0 {
		return types.NewErrorWithStatusCode(fmt.Errorf("预扣费额度失败, 用户剩余额度: %s, 需要预扣费额度: %s", logger.FormatQuota(userQuota), logger.FormatQuota(preConsumedQuota)), types.ErrorCodeInsufficientUserQuota, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
	}

	trustQuota := common.GetTrustQuota()

	relayInfo.UserQuota = userQuota
	if userQuota > trustQuota {
		// 用户额度充足，判断令牌额度是否充足
		if !relayInfo.TokenUnlimited {
			// 非无限令牌，判断令牌额度是否充足
			tokenQuota := c.GetInt("token_quota")
			if tokenQuota > trustQuota {
				// 令牌额度充足，信任令牌
				preConsumedQuota = 0
				logger.LogInfo(c, fmt.Sprintf("用户 %d 剩余额度 %s 且令牌 %d 额度 %d 充足, 信任且不需要预扣费", relayInfo.UserId, logger.FormatQuota(userQuota), relayInfo.TokenId, tokenQuota))
			}
		} else {
			// in this case, we do not pre-consume quota
			// because the user has enough quota
			preConsumedQuota = 0
			logger.LogInfo(c, fmt.Sprintf("用户 %d 额度充足且为无限额度令牌, 信任且不需要预扣费", relayInfo.UserId))
		}
	}

	if preConsumedQuota > 0 {
		err := PreConsumeTokenQuota(relayInfo, preConsumedQuota)
		if err != nil {
			return types.NewErrorWithStatusCode(err, types.ErrorCodePreConsumeTokenQuotaFailed, http.StatusForbidden, types.ErrOptionWithSkipRetry(), types.ErrOptionWithNoRecordErrorLog())
		}
		err = model.DecreaseUserQuota(relayInfo.UserId, preConsumedQuota)
		if err != nil {
			return types.NewError(err, types.ErrorCodeUpdateDataError, types.ErrOptionWithSkipRetry())
		}
		logger.LogInfo(c, fmt.Sprintf("用户 %d 预扣费 %s, 预扣费后剩余额度: %s", relayInfo.UserId, logger.FormatQuota(preConsumedQuota), logger.FormatQuota(userQuota-preConsumedQuota)))

		// Register inflight record: cleared on normal finish or returned on crash recovery
		requestId := c.GetString(common.RequestIdKey)
		registerInflightRequest(requestId, relayInfo.UserId, preConsumedQuota, relayInfo.TokenId, relayInfo.TokenKey, relayInfo.IsPlayground)
	}
	relayInfo.FinalPreConsumedQuota = preConsumedQuota
	return nil
}
