package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/video-mobile-app/go-server/internal/constants"
	"github.com/video-mobile-app/go-server/internal/dto"
	"github.com/video-mobile-app/go-server/internal/models"
	"github.com/video-mobile-app/go-server/internal/service"
	"github.com/video-mobile-app/go-server/internal/utils"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorJSON(c, err)
		return
	}

	if err := ValidateRegisterRequest(&req); err != nil {
		HandleValidationError(c, err)
		return
	}

	response, accessToken, refreshToken, err := h.authService.Register(&req)
	if err != nil {
		if err.Error() == "user with this email already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server error",
		})
		return
	}

	utils.SetAuthCookies(c.Writer, accessToken, refreshToken)
	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ValidationErrorJSON(c, err)
		return
	}

	response, accessToken, refreshToken, err := h.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": err.Error(),
		})
		return
	}

	utils.SetAuthCookies(c.Writer, accessToken, refreshToken)
	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	refreshToken, err := c.Cookie(constants.CookieRefreshToken)
	if err != nil || refreshToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Refresh token not provided",
		})
		return
	}

	accessToken, newRefreshToken, err := h.authService.RefreshToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": err.Error(),
		})
		return
	}

	utils.SetAuthCookies(c.Writer, accessToken, newRefreshToken)
	c.JSON(http.StatusOK, dto.TokenResponse{
		Success: true,
		Message: "Token refreshed successfully",
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	utils.ClearAuthCookies(c.Writer)
	c.JSON(http.StatusOK, dto.TokenResponse{
		Success: true,
		Message: "Logout successful",
	})
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Unauthorized",
		})
		return
	}

	userID, ok := userIDValue.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Internal server error",
		})
		return
	}

	user, err := h.authService.ValidateUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "User not found",
		})
		return
	}

	response := dto.AuthResponse{
		Success: true,
		Message: "User retrieved successfully",
		Data: &dto.AuthData{
			User: mapUserToResponse(user),
		},
	}

	c.JSON(http.StatusOK, response)
}

func mapUserToResponse(user *models.User) dto.UserResponse {
	return dto.UserResponse{
		ID:        user.ID.String(),
		Name:      user.Name,
		Email:     user.Email,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt.Format(time.RFC3339),
		UpdatedAt: user.UpdatedAt.Format(time.RFC3339),
	}
}
