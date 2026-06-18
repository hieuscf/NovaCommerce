package cache

import (
	"context"
	"time"

	"github.com/google/uuid"
	"golang.org/x/sync/singleflight"

	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/pkg/pagination"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
	"github.com/novacommerce/services/catalog-service/internal/domain/repository"
)

// CachedProductRepository decorates a ProductRepository with cache-aside reads.
type CachedProductRepository struct {
	repo  repository.ProductRepository
	cache ProductCacheRepository
	log   *pkglogger.Logger
	ttl   time.Duration
	sf    singleflight.Group
}

// NewCachedProductRepository wraps repo with Redis cache-aside for product detail.
func NewCachedProductRepository(
	repo repository.ProductRepository,
	cache ProductCacheRepository,
	log *pkglogger.Logger,
	ttl time.Duration,
) repository.ProductRepository {
	if ttl <= 0 {
		ttl = DefaultProductCacheTTL
	}
	return &CachedProductRepository{
		repo:  repo,
		cache: cache,
		log:   log,
		ttl:   ttl,
	}
}

func (r *CachedProductRepository) Create(ctx context.Context, product *entity.Product) error {
	return r.repo.Create(ctx, product)
}

func (r *CachedProductRepository) Update(ctx context.Context, product *entity.Product) error {
	if err := r.repo.Update(ctx, product); err != nil {
		return err
	}
	if err := r.cache.Invalidate(ctx, product.ID, product.Slug); err != nil {
		r.logCacheInvalidateFailed(err, product.ID)
	}
	return nil
}

func (r *CachedProductRepository) Archive(ctx context.Context, id uuid.UUID) error {
	existing, err := r.repo.FindByID(ctx, id)
	if err != nil {
		return err
	}

	if err := r.repo.Archive(ctx, id); err != nil {
		return err
	}

	if err := r.cache.Invalidate(ctx, id, existing.Slug); err != nil {
		r.logCacheInvalidateFailed(err, id)
	}
	return nil
}

func (r *CachedProductRepository) FindByID(ctx context.Context, id uuid.UUID) (*entity.Product, error) {
	if product, err := r.cache.GetByID(ctx, id); err != nil {
		r.logCacheGetFailed(err, productKeyByID(id))
	} else if product != nil {
		return product, nil
	}

	sfKey := "product:id:" + id.String()
	value, err, _ := r.sf.Do(sfKey, func() (any, error) {
		if cached, cerr := r.cache.GetByID(ctx, id); cerr != nil {
			r.logCacheGetFailed(cerr, productKeyByID(id))
		} else if cached != nil {
			return cached, nil
		}

		product, err := r.repo.FindByID(ctx, id)
		if err != nil {
			return nil, err
		}

		if setErr := r.cache.Set(ctx, product, r.ttl); setErr != nil {
			r.logCacheSetFailed(setErr, product.ID)
		}
		return product, nil
	})
	if err != nil {
		return nil, err
	}
	return value.(*entity.Product), nil
}

func (r *CachedProductRepository) FindBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	if product, err := r.cache.GetBySlug(ctx, slug); err != nil {
		r.logCacheGetFailed(err, productKeyBySlug(slug))
	} else if product != nil {
		return product, nil
	}

	sfKey := "product:slug:" + slug
	value, err, _ := r.sf.Do(sfKey, func() (any, error) {
		if cached, cerr := r.cache.GetBySlug(ctx, slug); cerr != nil {
			r.logCacheGetFailed(cerr, productKeyBySlug(slug))
		} else if cached != nil {
			return cached, nil
		}

		product, err := r.repo.FindBySlug(ctx, slug)
		if err != nil {
			return nil, err
		}

		if setErr := r.cache.Set(ctx, product, r.ttl); setErr != nil {
			r.logCacheSetFailed(setErr, product.ID)
		}
		return product, nil
	})
	if err != nil {
		return nil, err
	}
	return value.(*entity.Product), nil
}

func (r *CachedProductRepository) List(
	ctx context.Context,
	filter repository.ProductFilter,
	page pagination.CursorParams,
) ([]*entity.Product, int64, error) {
	return r.repo.List(ctx, filter, page)
}

func (r *CachedProductRepository) logCacheGetFailed(err error, key string) {
	if r.log == nil {
		return
	}
	r.log.Warn().Err(err).Str("key", key).Msg("cache.get failed, falling back to db")
}

func (r *CachedProductRepository) logCacheSetFailed(err error, id uuid.UUID) {
	if r.log == nil {
		return
	}
	r.log.Warn().Err(err).Str("id", id.String()).Msg("cache.set failed")
}

func (r *CachedProductRepository) logCacheInvalidateFailed(err error, id uuid.UUID) {
	if r.log == nil {
		return
	}
	r.log.Error().Err(err).Str("id", id.String()).Msg("cache.invalidate failed")
}
