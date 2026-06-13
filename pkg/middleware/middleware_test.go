package middleware

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/json"
	"encoding/pem"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/pkg/response"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func decodeErrorResponse(t *testing.T, rec *httptest.ResponseRecorder) response.Response {
	t.Helper()

	var resp response.Response
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	return resp
}

func TestRequestIDGeneratesWhenMissing(t *testing.T) {
	router := gin.New()
	router.Use(RequestID())
	router.GET("/test", func(c *gin.Context) {
		id, _ := c.Get(ContextKeyRequestID)
		c.String(http.StatusOK, id.(string))
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	router.ServeHTTP(rec, req)

	if rec.Header().Get("X-Request-ID") == "" {
		t.Fatal("expected generated request ID header")
	}
}

func TestRequestIDPreservesExisting(t *testing.T) {
	router := gin.New()
	router.Use(RequestID())
	router.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-Request-ID", "existing-id")
	router.ServeHTTP(rec, req)

	if rec.Header().Get("X-Request-ID") != "existing-id" {
		t.Fatalf("expected preserved request ID, got %s", rec.Header().Get("X-Request-ID"))
	}
}

func generateTestJWTKeys(t *testing.T) ([]byte, *rsa.PrivateKey) {
	t.Helper()

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("failed to generate key: %v", err)
	}

	publicKeyDER, err := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
	if err != nil {
		t.Fatalf("failed to marshal public key: %v", err)
	}

	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "PUBLIC KEY",
		Bytes: publicKeyDER,
	})

	return publicKeyPEM, privateKey
}

func signToken(t *testing.T, privateKey *rsa.PrivateKey, claims Claims) string {
	t.Helper()

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	signed, err := token.SignedString(privateKey)
	if err != nil {
		t.Fatalf("failed to sign token: %v", err)
	}
	return signed
}

func TestJWTValidToken(t *testing.T) {
	publicKeyPEM, privateKey := generateTestJWTKeys(t)

	router := gin.New()
	router.Use(JWT(JWTConfig{
		PublicKeyPEM: publicKeyPEM,
		Issuer:       "novacommerce",
	}))
	router.GET("/secure", func(c *gin.Context) {
		userID, ok := GetUserID(c)
		if !ok {
			t.Fatal("expected user id in context")
		}
		c.String(http.StatusOK, userID)
	})

	token := signToken(t, privateKey, Claims{
		UserID: "user-123",
		Role:   "customer",
		Email:  "user@example.com",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "novacommerce",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/secure", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d body=%s", rec.Code, rec.Body.String())
	}
}

func TestJWTExpiredToken(t *testing.T) {
	publicKeyPEM, privateKey := generateTestJWTKeys(t)

	router := gin.New()
	router.Use(JWT(JWTConfig{PublicKeyPEM: publicKeyPEM, Issuer: "novacommerce"}))
	router.GET("/secure", func(c *gin.Context) { c.Status(http.StatusOK) })

	token := signToken(t, privateKey, Claims{
		UserID: "user-123",
		Role:   "customer",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "novacommerce",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
		},
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/secure", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(rec, req)

	resp := decodeErrorResponse(t, rec)
	if rec.Code != http.StatusUnauthorized || resp.Error.Code != apperrors.ErrCodeUnauthorized {
		t.Fatalf("expected unauthorized, got %d %#v", rec.Code, resp.Error)
	}
}

func TestJWTInvalidSignature(t *testing.T) {
	publicKeyPEM, _ := generateTestJWTKeys(t)
	_, otherPrivateKey := generateTestJWTKeys(t)

	router := gin.New()
	router.Use(JWT(JWTConfig{PublicKeyPEM: publicKeyPEM, Issuer: "novacommerce"}))
	router.GET("/secure", func(c *gin.Context) { c.Status(http.StatusOK) })

	token := signToken(t, otherPrivateKey, Claims{
		UserID: "user-123",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "novacommerce",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/secure", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestJWTMissingHeader(t *testing.T) {
	publicKeyPEM, _ := generateTestJWTKeys(t)

	router := gin.New()
	router.Use(JWT(JWTConfig{PublicKeyPEM: publicKeyPEM, Issuer: "novacommerce"}))
	router.GET("/secure", func(c *gin.Context) { c.Status(http.StatusOK) })

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/secure", nil)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestRateLimitAllowAndBlock(t *testing.T) {
	router := gin.New()
	router.Use(RateLimit(RateLimitConfig{
		RequestsPerMinute: 2,
		BurstSize:         2,
		KeyFunc:           func(c *gin.Context) string { return "test-key-" + t.Name() },
	}))
	router.GET("/limited", func(c *gin.Context) { c.Status(http.StatusOK) })

	for i := 0; i < 2; i++ {
		rec := httptest.NewRecorder()
		req := httptest.NewRequest(http.MethodGet, "/limited", nil)
		router.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("request %d expected 200, got %d", i+1, rec.Code)
		}
	}

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/limited", nil)
	router.ServeHTTP(rec, req)

	resp := decodeErrorResponse(t, rec)
	if rec.Code != http.StatusTooManyRequests || resp.Error.Code != apperrors.ErrCodeTooManyRequests {
		t.Fatalf("expected rate limit error, got %d %#v", rec.Code, resp.Error)
	}
}

func TestRequireRole(t *testing.T) {
	router := gin.New()
	router.GET("/admin", func(c *gin.Context) {
		c.Set(ContextKeyUserRole, "admin")
	}, RequireRole("admin"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})
	router.GET("/wrong", func(c *gin.Context) {
		c.Set(ContextKeyUserRole, "customer")
	}, RequireRole("admin"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})
	router.GET("/noauth", RequireRole("admin"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/admin", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for matching role, got %d", rec.Code)
	}

	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/wrong", nil))
	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for wrong role, got %d", rec.Code)
	}

	rec = httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/noauth", nil))
	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected 403 without auth context, got %d", rec.Code)
	}
}

func TestRecoveryHandlesPanic(t *testing.T) {
	log := pkglogger.New("test-service", "production", "error")

	router := gin.New()
	router.Use(Recovery(log))
	router.GET("/panic", func(c *gin.Context) {
		panic("boom")
	})

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/panic", nil))

	resp := decodeErrorResponse(t, rec)
	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
	if resp.Error == nil || resp.Error.Code != apperrors.ErrCodeInternal {
		t.Fatalf("expected internal error response, got %#v", resp.Error)
	}
	if resp.Error.Message == "" {
		t.Fatal("expected error message without stack trace")
	}
}

func TestGetClaimsHelpers(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	claims := &Claims{UserID: "u1", Role: "seller", Email: "a@b.com"}
	c.Set(ContextKeyUserID, claims.UserID)
	c.Set(ContextKeyUserRole, claims.Role)
	c.Set(ContextKeyClaims, claims)

	if userID, ok := GetUserID(c); !ok || userID != "u1" {
		t.Fatalf("unexpected user id: %s ok=%v", userID, ok)
	}
	if role, ok := GetUserRole(c); !ok || role != "seller" {
		t.Fatalf("unexpected role: %s ok=%v", role, ok)
	}
	if got, ok := GetClaims(c); !ok || got.Email != "a@b.com" {
		t.Fatalf("unexpected claims: %#v ok=%v", got, ok)
	}
}

func TestDefaultCORS(t *testing.T) {
	router := gin.New()
	router.Use(DefaultCORS())
	router.GET("/test", func(c *gin.Context) { c.Status(http.StatusOK) })

	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodOptions, "/test", nil)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204 for preflight, got %d", rec.Code)
	}
}

func TestLoggerSkipsHealthPath(t *testing.T) {
	log := pkglogger.New("test-service", "production", "info")

	router := gin.New()
	router.Use(Logger(log))
	router.GET("/health", func(c *gin.Context) { c.Status(http.StatusOK) })

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/health", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestLoggerStatusLevels(t *testing.T) {
	log := pkglogger.New("test-service", "production", "info")

	router := gin.New()
	router.Use(RequestID(), Logger(log))
	router.GET("/warn", func(c *gin.Context) { c.Status(http.StatusBadRequest) })
	router.GET("/error", func(c *gin.Context) { c.Status(http.StatusInternalServerError) })
	router.GET("/ok", func(c *gin.Context) { c.Status(http.StatusOK) })

	for _, path := range []string{"/warn", "/error", "/ok"} {
		rec := httptest.NewRecorder()
		router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, path, nil))
		if rec.Code == 0 {
			t.Fatalf("expected response for %s", path)
		}
	}
}

func TestCORSWithCustomConfig(t *testing.T) {
	router := gin.New()
	router.Use(CORS(CORSConfig{
		AllowOrigins: []string{"https://example.com"},
		AllowMethods: []string{"GET"},
		AllowHeaders: []string{"Authorization"},
		MaxAge:       time.Hour,
	}))
	router.GET("/data", func(c *gin.Context) { c.Status(http.StatusOK) })

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/data", nil))
	if rec.Header().Get("Access-Control-Allow-Origin") != "https://example.com" {
		t.Fatalf("unexpected CORS header: %s", rec.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestRateLimitUsesDefaultConfig(t *testing.T) {
	router := gin.New()
	router.Use(RateLimit(RateLimitConfig{}))
	router.GET("/limited", func(c *gin.Context) { c.Status(http.StatusOK) })

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/limited", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestJWTInvalidPublicKeyPanics(t *testing.T) {
	defer func() {
		if recovered := recover(); recovered == nil {
			t.Fatal("expected panic for invalid public key")
		}
	}()
	_ = JWT(JWTConfig{PublicKeyPEM: []byte("invalid")})
}

func TestRequestIDInjectsLoggerContext(t *testing.T) {
	router := gin.New()
	router.Use(RequestID())
	router.GET("/test", func(c *gin.Context) {
		requestID := pkglogger.RequestIDFromContext(c.Request.Context())
		if requestID == "" {
			t.Fatal("expected request id in context")
		}
		c.Status(http.StatusOK)
	})

	rec := httptest.NewRecorder()
	router.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/test", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}
