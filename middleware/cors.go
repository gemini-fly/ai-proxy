package middleware

import (
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	config := cors.DefaultConfig()

	// 支持通过环境变量配置允许的跨域来源，多个用逗号分隔
	// 示例: CORS_ALLOW_ORIGINS=https://app.yourdomain.com,https://admin.yourdomain.com
	allowOrigins := os.Getenv("CORS_ALLOW_ORIGINS")
	if allowOrigins != "" {
		origins := strings.Split(allowOrigins, ",")
		for i := range origins {
			origins[i] = strings.TrimSpace(origins[i])
		}
		config.AllowOrigins = origins
		config.AllowCredentials = true
	} else {
		// 未配置时允许所有来源，但禁止携带凭据（防止 CSRF）
		// 生产环境建议设置 CORS_ALLOW_ORIGINS
		config.AllowAllOrigins = true
		config.AllowCredentials = false
	}

	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Content-Type", "Authorization", "New-Api-User"}
	return cors.New(config)
}
