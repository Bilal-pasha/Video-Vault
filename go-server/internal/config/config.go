package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	CORS     CORSConfig
}

type ServerConfig struct {
	Port      int
	Env       string
	AssetsURL string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret         string
	RefreshSecret  string
	ExpiresIn      time.Duration
	RefreshExpires time.Duration
}

type CORSConfig struct {
	Origin     string
	Credentials bool
}

var AppConfig *Config

func Load() error {
	_ = godotenv.Load()

	AppConfig = &Config{
		Server: ServerConfig{
			Port:      getEnvAsInt("SERVER_PORT", 8000),
			Env:       getEnv("NODE_ENV", "development"),
			AssetsURL: getEnv("ASSETS_URL", "http://localhost:8000"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "postgres"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("POSTGRES_USER", "postgres"),
			Password: getEnv("POSTGRES_PASSWORD", "postgres"),
			DBName:   getEnv("POSTGRES_DB", "video_app"),
		},
		JWT: JWTConfig{
			Secret:         getEnv("JWT_SECRET", "your-secret-key"),
			RefreshSecret:  getEnv("JWT_REFRESH_SECRET", "your-refresh-secret-key"),
			ExpiresIn:      parseDuration(getEnv("JWT_EXPIRES_IN", "1h")),
			RefreshExpires: parseDuration(getEnv("JWT_REFRESH_EXPIRES_IN", "7d")),
		},
		CORS: CORSConfig{
			Origin:      getEnv("CORS_ORIGIN", "*"),
			Credentials: true,
		},
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func parseDuration(s string) time.Duration {
	if len(s) < 2 {
		return time.Hour
	}

	unit := s[len(s)-1:]
	valueStr := s[:len(s)-1]
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return time.Hour
	}

	switch unit {
	case "s":
		return time.Duration(value) * time.Second
	case "m":
		return time.Duration(value) * time.Minute
	case "h":
		return time.Duration(value) * time.Hour
	case "d":
		return time.Duration(value) * 24 * time.Hour
	default:
		return time.Hour
	}
}
