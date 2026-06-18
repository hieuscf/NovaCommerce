package service

import (
	"context"
	"fmt"

	pkgcache "github.com/novacommerce/pkg/cache"
	pkgdatabase "github.com/novacommerce/pkg/database"
)

// HealthData describes dependency check outcomes for GET /health.
type HealthData struct {
	Status      string `json:"status"`
	DBStatus    string `json:"db_status"`
	RedisStatus string `json:"redis_status"`
}

// HealthService performs connectivity checks for dependencies.
type HealthService struct {
	db    *pkgdatabase.DB
	cache *pkgcache.Cache
}

// NewHealthService creates a HealthService.
func NewHealthService(db *pkgdatabase.DB, cache *pkgcache.Cache) *HealthService {
	return &HealthService{
		db:    db,
		cache: cache,
	}
}

// Check verifies database and Redis connectivity.
func (s *HealthService) Check(ctx context.Context) (HealthData, bool) {
	dbStatus := s.checkDatabase(ctx)
	redisStatus := s.checkRedis(ctx)

	allFailed := dbStatus != "ok" && redisStatus != "ok"

	status := "ok"
	if allFailed {
		status = "unavailable"
	}

	return HealthData{
		Status:      status,
		DBStatus:    dbStatus,
		RedisStatus: redisStatus,
	}, allFailed
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
