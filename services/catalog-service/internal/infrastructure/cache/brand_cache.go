package cache

import (
	"context"
	"time"

	"github.com/google/uuid"
	pkgcache "github.com/novacommerce/pkg/cache"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

const (
	brandsAllCacheKey    = "catalog:brands:all"
	brandsActiveCacheKey = "catalog:brands:active"
	brandCacheKeyPrefix  = "catalog:brand:"

	// DefaultBrandCacheTTL is the TTL for cached brand data.
	DefaultBrandCacheTTL = time.Hour
)

type cachedBrandRepository struct {
	inner repository.BrandRepository
	cache *pkgcache.Cache
	log   *pkglogger.Logger
	ttl   time.Duration
}

// NewCachedBrandRepository wraps a BrandRepository with Redis cache-aside reads.
func NewCachedBrandRepository(
	inner repository.BrandRepository,
	cache *pkgcache.Cache,
	log *pkglogger.Logger,
	ttl time.Duration,
) repository.BrandRepository {
	if ttl <= 0 {
		ttl = DefaultBrandCacheTTL
	}
	return &cachedBrandRepository{
		inner: inner,
		cache: cache,
		log:   log,
		ttl:   ttl,
	}
}

func (r *cachedBrandRepository) GetAll(ctx context.Context, onlyActive bool) ([]*domain.Brand, error) {
	key := brandsAllCacheKey
	if onlyActive {
		key = brandsActiveCacheKey
	}

	if r.cache != nil {
		brands, err := pkgcache.Get[[]*domain.Brand](ctx, r.cache, key)
		if err == nil {
			return brands, nil
		}
		if isCacheMiss(err) {
			r.logBrandCacheMiss(key)
		} else {
			r.logBrandCacheWarn("get", key, err)
		}
	}

	brands, err := r.inner.GetAll(ctx, onlyActive)
	if err != nil {
		return nil, err
	}

	r.setBrandCache(ctx, key, brands)
	return brands, nil
}

func (r *cachedBrandRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Brand, error) {
	key := brandKey(id)
	if r.cache != nil {
		brand, err := pkgcache.Get[*domain.Brand](ctx, r.cache, key)
		if err == nil {
			return brand, nil
		}
		if isCacheMiss(err) {
			r.logBrandCacheMiss(key)
		} else {
			r.logBrandCacheWarn("get", key, err)
		}
	}

	brand, err := r.inner.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	r.setBrandCache(ctx, key, brand)
	return brand, nil
}

func (r *cachedBrandRepository) Create(ctx context.Context, brand *domain.Brand) error {
	if err := r.inner.Create(ctx, brand); err != nil {
		return err
	}
	r.invalidateBrandCaches(ctx, brand.ID)
	return nil
}

func (r *cachedBrandRepository) Update(ctx context.Context, brand *domain.Brand) error {
	if err := r.inner.Update(ctx, brand); err != nil {
		return err
	}
	r.invalidateBrandCaches(ctx, brand.ID)
	return nil
}

func (r *cachedBrandRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	return r.inner.ExistsBySlug(ctx, slug)
}

func (r *cachedBrandRepository) invalidateBrandCaches(ctx context.Context, id uuid.UUID) {
	r.deleteBrandCacheKeys(ctx, brandsAllCacheKey, brandsActiveCacheKey, brandKey(id))
}

func (r *cachedBrandRepository) setBrandCache(ctx context.Context, key string, value any) {
	if r.cache == nil {
		return
	}
	if err := pkgcache.Set(ctx, r.cache, key, value, r.ttl); err != nil {
		r.logBrandCacheWarn("set", key, err)
	}
}

func (r *cachedBrandRepository) deleteBrandCacheKeys(ctx context.Context, keys ...string) {
	if r.cache == nil || len(keys) == 0 {
		return
	}
	if err := pkgcache.Del(ctx, r.cache, keys...); err != nil {
		r.logBrandCacheWarn("del", keys[0], err)
	}
}

func brandKey(id uuid.UUID) string {
	return brandCacheKeyPrefix + id.String()
}

func (r *cachedBrandRepository) logBrandCacheMiss(key string) {
	if r.log == nil {
		return
	}
	r.log.Debug().Str("key", key).Msg("cache miss")
}

func (r *cachedBrandRepository) logBrandCacheWarn(op, key string, err error) {
	if r.log == nil {
		return
	}
	r.log.Warn().Err(err).Str("operation", op).Str("key", key).Msg("cache error, falling back to db")
}
