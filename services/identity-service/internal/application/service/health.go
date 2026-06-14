package service

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

const serviceVersion = "1.0.0"

// HealthResult describes dependency check outcomes.
type HealthResult struct {
	Status  string            `json:"status"`
	Service string            `json:"service"`
	Version string            `json:"version"`
	Checks  map[string]string `json:"checks"`
}

// HealthService performs connectivity checks for dependencies.
type HealthService struct {
	pool    *pgxpool.Pool
	redis   *redis.Client
	service string
}

// NewHealthService creates a HealthService.
func NewHealthService(pool *pgxpool.Pool, redisClient *redis.Client, serviceName string) *HealthService {
	return &HealthService{
		pool:    pool,
		redis:   redisClient,
		service: serviceName,
	}
}

// Check verifies database and Redis connectivity.
func (s *HealthService) Check(ctx context.Context) (HealthResult, bool) {
	checks := map[string]string{
		"database": s.checkDatabase(ctx),
		"redis":    s.checkRedis(ctx),
	}

	allFailed := true
	for _, status := range checks {
		if status == "ok" {
			allFailed = false
			break
		}
	}

	overallStatus := "ok"
	if allFailed {
		overallStatus = "unavailable"
	}

	return HealthResult{
		Status:  overallStatus,
		Service: s.service,
		Version: serviceVersion,
		Checks:  checks,
	}, allFailed
}

func (s *HealthService) checkDatabase(ctx context.Context) string {
	if s.pool == nil {
		return "error: database pool is not initialized"
	}
	if err := s.pool.Ping(ctx); err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return "ok"
}

func (s *HealthService) checkRedis(ctx context.Context) string {
	if s.redis == nil {
		return "error: redis client is not initialized"
	}
	if err := s.redis.Ping(ctx).Err(); err != nil {
		return fmt.Sprintf("error: %v", err)
	}
	return "ok"
}
