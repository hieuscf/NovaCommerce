package application

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	apperrors "github.com/novacommerce/pkg/errors"
)

const fileServiceRequestTimeout = 3 * time.Second

// FileServiceClient validates uploaded files and builds public URLs.
type FileServiceClient interface {
	ValidateFileExists(ctx context.Context, fileKey string) error
	BuildURL(fileKey string) string
}

type fileServiceClient struct {
	baseURL   string
	publicURL string
	client    *http.Client
}

// NewFileServiceClient creates an HTTP client for the file service.
func NewFileServiceClient(baseURL, publicBaseURL string) FileServiceClient {
	if publicBaseURL == "" {
		publicBaseURL = baseURL
	}
	return &fileServiceClient{
		baseURL:   strings.TrimRight(baseURL, "/"),
		publicURL: strings.TrimRight(publicBaseURL, "/"),
		client:    &http.Client{Timeout: fileServiceRequestTimeout},
	}
}

func (c *fileServiceClient) ValidateFileExists(ctx context.Context, fileKey string) error {
	if strings.TrimSpace(fileKey) == "" {
		return fmt.Errorf("file key is required")
	}

	endpoint := fmt.Sprintf("%s/files/%s", c.baseURL, url.PathEscape(fileKey))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return fmt.Errorf("create file validation request: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return fmt.Errorf("validate file: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return apperrors.NewBadRequest("file not found")
	}
	if resp.StatusCode >= http.StatusBadRequest {
		return apperrors.NewBadRequest(fmt.Sprintf("file validation failed with status %d", resp.StatusCode))
	}
	return nil
}

func (c *fileServiceClient) BuildURL(fileKey string) string {
	return fmt.Sprintf("%s/files/%s", c.publicURL, url.PathEscape(fileKey))
}
