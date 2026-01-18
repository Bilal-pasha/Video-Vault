package main

import (
	"fmt"
	"log"
	"os"

	"github.com/video-mobile-app/go-server/internal/config"
	"github.com/video-mobile-app/go-server/internal/database"
	"github.com/video-mobile-app/go-server/internal/router"
)

func main() {
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	r := router.SetupRouter()

	port := config.AppConfig.Server.Port
	assetsURL := config.AppConfig.Server.AssetsURL

	log.Printf("Application is running on: %s", assetsURL)
	log.Printf("Server starting on port: %d", port)

	if err := r.Run(fmt.Sprintf("0.0.0.0:%d", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
		os.Exit(1)
	}
}
