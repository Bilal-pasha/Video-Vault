package service

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/video-mobile-app/go-server/internal/dto"
	"github.com/video-mobile-app/go-server/internal/models"
	"github.com/video-mobile-app/go-server/internal/repository"
	"github.com/video-mobile-app/go-server/internal/utils"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(req *dto.RegisterRequest) (*dto.AuthResponse, string, string, error)
	Login(req *dto.LoginRequest) (*dto.AuthResponse, string, string, error)
	RefreshToken(refreshToken string) (string, string, error)
	ValidateUser(userID uuid.UUID) (*models.User, error)
}

type authService struct {
	userRepo repository.UserRepository
}

func NewAuthService(userRepo repository.UserRepository) AuthService {
	return &authService{
		userRepo: userRepo,
	}
}

func (s *authService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, string, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	existingUser, err := s.userRepo.FindByEmail(email)
	if err == nil && existingUser != nil {
		return nil, "", "", errors.New("user with this email already exists")
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, "", "", err
	}

	user := &models.User{
		Name:     strings.TrimSpace(req.Name),
		Email:    email,
		Password: req.Password,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, "", "", err
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	response := &dto.AuthResponse{
		Success: true,
		Message: "Account created successfully",
		Data: &dto.AuthData{
			User: mapUserToDTO(user),
		},
	}

	return response, accessToken, refreshToken, nil
}

func (s *authService) Login(req *dto.LoginRequest) (*dto.AuthResponse, string, string, error) {
	email := strings.ToLower(strings.TrimSpace(req.Email))

	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", "", errors.New("invalid email or password")
		}
		return nil, "", "", err
	}

	if !user.ComparePassword(req.Password) {
		return nil, "", "", errors.New("invalid email or password")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email)
	if err != nil {
		return nil, "", "", err
	}

	response := &dto.AuthResponse{
		Success: true,
		Message: "Login successful",
		Data: &dto.AuthData{
			User: mapUserToDTO(user),
		},
	}

	return response, accessToken, refreshToken, nil
}

func (s *authService) RefreshToken(refreshToken string) (string, string, error) {
	claims, err := utils.ValidateToken(refreshToken, true)
	if err != nil {
		return "", "", errors.New("invalid or expired refresh token")
	}

	user, err := s.ValidateUser(claims.UserID)
	if err != nil {
		return "", "", errors.New("invalid refresh token")
	}

	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email)
	if err != nil {
		return "", "", err
	}

	newRefreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email)
	if err != nil {
		return "", "", err
	}

	return accessToken, newRefreshToken, nil
}

func (s *authService) ValidateUser(userID uuid.UUID) (*models.User, error) {
	return s.userRepo.FindByID(userID)
}

func mapUserToDTO(user *models.User) dto.UserResponse {
	return dto.UserResponse{
		ID:        user.ID.String(),
		Name:      user.Name,
		Email:     user.Email,
		Avatar:    user.Avatar,
		CreatedAt: user.CreatedAt.Format("2006-01-02T15:04:05.000Z"),
		UpdatedAt: user.UpdatedAt.Format("2006-01-02T15:04:05.000Z"),
	}
}
