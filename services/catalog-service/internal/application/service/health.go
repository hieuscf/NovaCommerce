package service

import (
	"context"
	"fmt"

	pkgcache "github.com/novacommerce/pkg/cache"
	pkgdatabase "github.com/novacommerce/pkg/database"
)

// DependencyStatus maps dependency names to health check results.
type DependencyStatus map[string]string

// HealthResponse is returned by GET /health.
type HealthResponse struct {
	Status       string           `json:"status"`
	Dependencies DependencyStatus `json:"dependencies"`
	Service      string           `json:"service"`
	Version      string           `json:"version"`
}

// HealthService performs connectivity checks for dependencies.
type HealthService struct {
	db           *pkgdatabase.DB
	cache        *pkgcache.Cache
	kafkaChecker func() error
	serviceName  string
	version      string
}

// NewHealthService creates a HealthService.
func NewHealthService(
	db *pkgdatabase.DB,
	cache *pkgcache.Cache,
	kafkaChecker func() error,
	serviceName, version string,
) *HealthService {
	return &HealthService{
		db:           db,
		cache:        cache,
		kafkaChecker: kafkaChecker,
		serviceName:  serviceName,
		version:      version,
	}
}

// Check verifies database, Redis, and Kafka connectivity.
func (s *HealthService) Check(ctx context.Context) (HealthResponse, bool) {
	deps := DependencyStatus{
		"postgres": s.checkDatabase(ctx),
		"redis":    s.checkRedis(ctx),
		"kafka":    s.checkKafka(),
	}

	healthy := true
	for _, status := range deps {
		if status != "ok" {
			healthy = false
			break
		}
	}

	status := "ok"
	if !healthy {
		status = "degraded"
	}

	return HealthResponse{
		Status:       status,
		Dependencies: deps,
		Service:      s.serviceName,
		Version:      s.version,
	}, healthy
}

func (s *HealthService) checkDatabase(ctx context.Context) string {
	if s.db == nil {
		return "error: database pool is not initialized"
	}
	if err := s.db.Ping(ctx); err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return "ok"
}

func (s *HealthService) checkRedis(ctx context.Context) string {
	if s.cache == nil {
		return "error: redis client is not initialized"
	}
	if err := s.cache.Ping(ctx); err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return "ok"
}

func (s *HealthService) checkKafka() string {
	if s.kafkaChecker == nil {
		return "error: kafka checker is not initialized"
	}
	if err := s.kafkaChecker(); err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return "ok"
}
