package dto

import "regexp"

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=128"`
}

func (r *RegisterRequest) ValidatePassword() error {
	password := r.Password

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[^A-Za-z0-9]`).MatchString(password)

	if !hasUpper {
		return &ValidationError{Field: "password", Message: "Password must contain at least one uppercase letter"}
	}
	if !hasLower {
		return &ValidationError{Field: "password", Message: "Password must contain at least one lowercase letter"}
	}
	if !hasNumber {
		return &ValidationError{Field: "password", Message: "Password must contain at least one number"}
	}
	if !hasSpecial {
		return &ValidationError{Field: "password", Message: "Password must contain at least one special character"}
	}

	return nil
}

type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UserResponse struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Email     string  `json:"email"`
	Avatar    *string `json:"avatar,omitempty"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type AuthResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    *AuthData   `json:"data,omitempty"`
}

type AuthData struct {
	User UserResponse `json:"user"`
}

type TokenResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
