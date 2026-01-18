package database

import (
	"fmt"
	"log"

	"github.com/video-mobile-app/go-server/internal/config"
	"github.com/video-mobile-app/go-server/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() error {
	cfg := config.AppConfig.Database

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=UTC",
		cfg.Host, cfg.User, cfg.Password, cfg.DBName, cfg.Port,
	)

	var err error
	var logLevel logger.LogLevel

	if config.AppConfig.Server.Env == "development" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Silent
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")

	return nil
}

func AutoMigrate() error {
	err := DB.AutoMigrate(
		&models.User{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	log.Println("Database migrations completed")
	return nil
}
