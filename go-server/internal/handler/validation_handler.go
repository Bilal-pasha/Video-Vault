package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/video-mobile-app/go-server/internal/dto"
	"github.com/video-mobile-app/go-server/internal/utils"
)

func ValidateRegisterRequest(req *dto.RegisterRequest) error {
	if err := req.ValidatePassword(); err != nil {
		return err
	}
	return nil
}

func HandleValidationError(c *gin.Context, err error) {
	if validationErr, ok := err.(*dto.ValidationError); ok {
		c.JSON(400, gin.H{
			"message": "Validation failed",
			"errors": map[string][]string{
				validationErr.Field: {validationErr.Message},
			},
		})
		return
	}
	utils.ValidationErrorJSON(c, err)
}
