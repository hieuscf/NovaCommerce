package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/response"
)

type apiEnvelope struct {
	Data  any `json:"data"`
	Meta  any `json:"meta"`
	Error any `json:"error"`
}

func respondSuccess(c *gin.Context, status int, data any) {
	c.JSON(status, apiEnvelope{
		Data:  data,
		Meta:  nil,
		Error: nil,
	})
}

func respondSuccessWithMeta(c *gin.Context, status int, data any, meta any) {
	c.JSON(status, apiEnvelope{
		Data:  data,
		Meta:  meta,
		Error: nil,
	})
}

func respondNoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func respondError(c *gin.Context, err error) {
	if appErr, ok := apperrors.IsAppError(err); ok {
		c.JSON(appErr.HTTPStatus, apiEnvelope{
			Data: nil,
			Meta: nil,
			Error: map[string]any{
				"code":    appErr.Code,
				"message": appErr.Message,
				"details": appErr.Details,
			},
		})
		return
	}

	response.Error(c.Writer, apperrors.NewInternal("internal server error"))
}

func respondValidationError(c *gin.Context, err error) {
	c.JSON(http.StatusBadRequest, apiEnvelope{
		Data: nil,
		Meta: nil,
		Error: map[string]any{
			"code":    apperrors.ErrCodeValidation,
			"message": err.Error(),
		},
	})
}
