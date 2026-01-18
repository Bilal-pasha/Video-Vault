package router

import (
	"github.com/gin-gonic/gin"
	"github.com/video-mobile-app/go-server/internal/handler"
	"github.com/video-mobile-app/go-server/internal/middleware"
	"github.com/video-mobile-app/go-server/internal/repository"
	"github.com/video-mobile-app/go-server/internal/service"
)

func SetupRouter() *gin.Engine {
	if gin.Mode() == gin.ReleaseMode {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()

	r.Use(middleware.LoggerMiddleware())
	r.Use(gin.Recovery())
	r.Use(middleware.CORSMiddleware())

	userRepo := repository.NewUserRepository()
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/signup", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/token/refresh", authHandler.RefreshToken)
			auth.POST("/logout", middleware.JWTAuthMiddleware(), authHandler.Logout)
			auth.GET("/me", middleware.JWTAuthMiddleware(), authHandler.GetCurrentUser)
		}
	}

	return r
}
