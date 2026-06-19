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
	categoryTreeCacheKey           = "catalog:categories:tree"
	categoryCacheKeyPrefix         = "catalog:category:"
	categoryDescendantsCacheSuffix = ":descendants"

	// DefaultCategoryCacheTTL is the TTL for cached category data.
	DefaultCategoryCacheTTL = time.Hour
)

type cachedCategoryRepository struct {
	inner repository.CategoryRepository
	cache *pkgcache.Cache
	log   *pkglogger.Logger
	ttl   time.Duration
}

// NewCachedCategoryRepository wraps a CategoryRepository with Redis cache-aside reads.
func NewCachedCategoryRepository(
	inner repository.CategoryRepository,
	cache *pkgcache.Cache,
	log *pkglogger.Logger,
	ttl time.Duration,
) repository.CategoryRepository {
	if ttl <= 0 {
		ttl = DefaultCategoryCacheTTL
	}
	return &cachedCategoryRepository{
		inner: inner,
		cache: cache,
		log:   log,
		ttl:   ttl,
	}
}

func (r *cachedCategoryRepository) GetAll(ctx context.Context) ([]*domain.Category, error) {
	if r.cache != nil {
		categories, err := pkgcache.Get[[]*domain.Category](ctx, r.cache, categoryTreeCacheKey)
		if err == nil {
			return categories, nil
		}
		if isCacheMiss(err) {
			r.logCacheMiss(categoryTreeCacheKey)
		} else {
			r.logCacheWarn("get", categoryTreeCacheKey, err)
		}
	}

	categories, err := r.inner.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	r.setCache(ctx, categoryTreeCacheKey, categories)
	return categories, nil
}

func (r *cachedCategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Category, error) {
	key := categoryKey(id)
	if r.cache != nil {
		category, err := pkgcache.Get[*domain.Category](ctx, r.cache, key)
		if err == nil {
			return category, nil
		}
		if isCacheMiss(err) {
			r.logCacheMiss(key)
		} else {
			r.logCacheWarn("get", key, err)
		}
	}

	category, err := r.inner.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	r.setCache(ctx, key, category)
	return category, nil
}

func (r *cachedCategoryRepository) GetDescendantIDs(ctx context.Context, id uuid.UUID) ([]uuid.UUID, error) {
	key := categoryDescendantsKey(id)
	if r.cache != nil {
		ids, err := pkgcache.Get[[]uuid.UUID](ctx, r.cache, key)
		if err == nil {
			return ids, nil
		}
		if isCacheMiss(err) {
			r.logCacheMiss(key)
		} else {
			r.logCacheWarn("get", key, err)
		}
	}

	ids, err := r.inner.GetDescendantIDs(ctx, id)
	if err != nil {
		return nil, err
	}

	r.setCache(ctx, key, ids)
	return ids, nil
}

func (r *cachedCategoryRepository) Create(ctx context.Context, category *domain.Category) error {
	if err := r.inner.Create(ctx, category); err != nil {
		return err
	}
	r.invalidateCategory(ctx, category)
	return nil
}

func (r *cachedCategoryRepository) Update(ctx context.Context, category *domain.Category) error {
	if err := r.inner.Update(ctx, category); err != nil {
		return err
	}
	r.invalidateCategory(ctx, category)
	return nil
}

func (r *cachedCategoryRepository) ExistsBySlug(ctx context.Context, slug string) (bool, error) {
	return r.inner.ExistsBySlug(ctx, slug)
}

func (r *cachedCategoryRepository) invalidateCategory(ctx context.Context, category *domain.Category) {
	keys := []string{categoryTreeCacheKey, categoryKey(category.ID)}
	if category.ParentID != nil {
		keys = append(keys, categoryDescendantsKey(*category.ParentID))
	}
	r.deleteCacheKeys(ctx, keys...)
}

func (r *cachedCategoryRepository) setCache(ctx context.Context, key string, value any) {
	if r.cache == nil {
		return
	}
	if err := pkgcache.Set(ctx, r.cache, key, value, r.ttl); err != nil {
		r.logCacheWarn("set", key, err)
	}
}

func (r *cachedCategoryRepository) deleteCacheKeys(ctx context.Context, keys ...string) {
	if r.cache == nil || len(keys) == 0 {
		return
	}
	if err := pkgcache.Del(ctx, r.cache, keys...); err != nil {
		r.logCacheWarn("del", keys[0], err)
	}
}

func categoryKey(id uuid.UUID) string {
	return categoryCacheKeyPrefix + id.String()
}

func categoryDescendantsKey(id uuid.UUID) string {
	return categoryCacheKeyPrefix + id.String() + categoryDescendantsCacheSuffix
}

func (r *cachedCategoryRepository) logCacheMiss(key string) {
	if r.log == nil {
		return
	}
	r.log.Debug().Str("key", key).Msg("cache miss")
}

func (r *cachedCategoryRepository) logCacheWarn(op, key string, err error) {
	if r.log == nil {
		return
	}
	r.log.Warn().Err(err).Str("operation", op).Str("key", key).Msg("cache error, falling back to db")
}
