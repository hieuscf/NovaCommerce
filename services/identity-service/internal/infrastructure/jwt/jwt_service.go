package jwt

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/config"
	"github.com/novacommerce/identity-service/internal/application/port"
)

const issuer = "novacommerce-identity"

type jwtService struct {
	privateKey *rsa.PrivateKey
	publicKey  *rsa.PublicKey
	accessTTL  time.Duration
}

type tokenClaims struct {
	Email string   `json:"email"`
	Roles []string `json:"roles"`
	jwt.RegisteredClaims
}

// NewJWTService loads RSA keys and returns a JWTService implementation.
func NewJWTService(cfg config.Config) (port.JWTService, error) {
	if cfg.JWT.PrivateKeyPath == "" {
		return nil, fmt.Errorf("jwt private key path is required")
	}
	if cfg.JWT.PublicKeyPath == "" {
		return nil, fmt.Errorf("jwt public key path is required")
	}

	privateKey, err := loadRSAPrivateKey(cfg.JWT.PrivateKeyPath)
	if err != nil {
		return nil, fmt.Errorf("load jwt private key: %w", err)
	}

	publicKey, err := loadRSAPublicKey(cfg.JWT.PublicKeyPath)
	if err != nil {
		return nil, fmt.Errorf("load jwt public key: %w", err)
	}

	accessTTL := time.Duration(cfg.JWT.AccessTokenTTL) * time.Minute

	return &jwtService{
		privateKey: privateKey,
		publicKey:  publicKey,
		accessTTL:  accessTTL,
	}, nil
}

func (s *jwtService) GenerateAccessToken(userID uuid.UUID, email string, roles []string) (string, error) {
	now := time.Now().UTC()
	claims := tokenClaims{
		Email: email,
		Roles: roles,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID.String(),
			Issuer:    issuer,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(s.accessTTL)),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	signed, err := token.SignedString(s.privateKey)
	if err != nil {
		return "", fmt.Errorf("jwtService.GenerateAccessToken: %w", err)
	}

	return signed, nil
}

func (s *jwtService) ValidateAccessToken(tokenString string) (*port.Claims, error) {
	parser := jwt.NewParser(jwt.WithIssuer(issuer))

	parsed, err := parser.ParseWithClaims(tokenString, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if token.Method != jwt.SigningMethodRS256 {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.publicKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("jwtService.ValidateAccessToken: %w", err)
	}

	claims, ok := parsed.Claims.(*tokenClaims)
	if !ok || !parsed.Valid {
		return nil, fmt.Errorf("jwtService.ValidateAccessToken: invalid token claims")
	}

	userID, err := uuid.Parse(claims.Subject)
	if err != nil {
		return nil, fmt.Errorf("jwtService.ValidateAccessToken: %w", err)
	}

	return &port.Claims{
		UserID: userID,
		Email:  claims.Email,
		Roles:  claims.Roles,
	}, nil
}

func loadRSAPrivateKey(path string) (*rsa.PrivateKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read private key file: %w", err)
	}

	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("decode private key pem")
	}

	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err != nil {
		parsed, parseErr := x509.ParsePKCS8PrivateKey(block.Bytes)
		if parseErr != nil {
			return nil, fmt.Errorf("parse private key: %w", err)
		}
		rsaKey, ok := parsed.(*rsa.PrivateKey)
		if !ok {
			return nil, fmt.Errorf("private key is not rsa")
		}
		return rsaKey, nil
	}

	return key, nil
}

func loadRSAPublicKey(path string) (*rsa.PublicKey, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read public key file: %w", err)
	}

	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("decode public key pem")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, fmt.Errorf("parse public key: %w", err)
	}

	rsaKey, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, fmt.Errorf("public key is not rsa")
	}

	return rsaKey, nil
}
