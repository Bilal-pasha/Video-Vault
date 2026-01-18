package utils

import (
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ErrorResponse struct {
	Message string              `json:"message"`
	Errors  map[string][]string `json:"errors,omitempty"`
}

func ValidationErrorResponse(err error) ErrorResponse {
	response := ErrorResponse{
		Message: "Validation failed",
		Errors:  make(map[string][]string),
	}

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, fieldError := range validationErrors {
			field := strings.ToLower(fieldError.Field())
			message := getValidationMessage(fieldError)
			response.Errors[field] = append(response.Errors[field], message)
		}
	}

	return response
}

func getValidationMessage(fieldError validator.FieldError) string {
	switch fieldError.Tag() {
	case "required":
		return "This field is required"
	case "email":
		return "Please enter a valid email address"
	case "min":
		return "Value is too short"
	case "max":
		return "Value is too long"
	default:
		return "Invalid value"
	}
}

func ErrorJSON(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, ErrorResponse{Message: message})
}

func ValidationErrorJSON(c *gin.Context, err error) {
	response := ValidationErrorResponse(err)
	c.JSON(400, response)
}
