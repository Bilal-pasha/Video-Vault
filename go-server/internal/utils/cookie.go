package utils

import (
	"net/http"
	"time"

	"github.com/video-mobile-app/go-server/internal/config"
)

func SetAuthCookies(w http.ResponseWriter, accessToken, refreshToken string) {
	cfg := config.AppConfig
	isProduction := cfg.Server.Env == "production"

	accessTokenMaxAge := int(cfg.JWT.ExpiresIn.Seconds())
	refreshTokenMaxAge := int(cfg.JWT.RefreshExpires.Seconds())

	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		HttpOnly: true,
		Secure:   isProduction,
		SameSite: getSameSite(isProduction),
		MaxAge:   accessTokenMaxAge,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   isProduction,
		SameSite: getSameSite(isProduction),
		MaxAge:   refreshTokenMaxAge,
		Path:     "/",
	})
}

func ClearAuthCookies(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     "access_token",
		Value:    "",
		HttpOnly: true,
		MaxAge:   -1,
		Path:     "/",
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		MaxAge:   -1,
		Path:     "/",
	})
}

func getSameSite(isProduction bool) http.SameSite {
	if isProduction {
		return http.SameSiteStrictMode
	}
	return http.SameSiteLaxMode
}
