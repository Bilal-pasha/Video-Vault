package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/video-mobile-app/go-server/internal/config"
)

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		cfg := config.AppConfig.CORS

		origin := c.Request.Header.Get("Origin")
		if cfg.Origin == "*" || origin == cfg.Origin {
			c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
		}

		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
