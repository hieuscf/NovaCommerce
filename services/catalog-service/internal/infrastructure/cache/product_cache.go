package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	pkgcache "github.com/novacommerce/pkg/cache"
	apperrors "github.com/novacommerce/pkg/errors"
	pkglogger "github.com/novacommerce/pkg/logger"
	"github.com/novacommerce/services/catalog-service/internal/domain/entity"
)

const (
	productKeyByIDPrefix   = "catalog:product:id:"
	productKeyBySlugPrefix = "catalog:product:slug:"

	// DefaultProductCacheTTL is the default TTL for cached product detail.
	DefaultProductCacheTTL = 5 * time.Minute
)

// ProductCacheRepository caches product detail by ID and slug.
type ProductCacheRepository interface {
	GetByID(ctx context.Context, id uuid.UUID) (*entity.Product, error)
	GetBySlug(ctx context.Context, slug string) (*entity.Product, error)
	Set(ctx context.Context, product *entity.Product, ttl time.Duration) error
	Invalidate(ctx context.Context, id uuid.UUID, slug string) error
}

type productRedisCache struct {
	client *pkgcache.Cache
	log    *pkglogger.Logger
}

// NewProductRedisCache creates a Redis-backed ProductCacheRepository.
func NewProductRedisCache(client *pkgcache.Cache, log *pkglogger.Logger) ProductCacheRepository {
	return &productRedisCache{client: client, log: log}
}

func productKeyByID(id uuid.UUID) string {
	return productKeyByIDPrefix + id.String()
}

func productKeyBySlug(slug string) string {
	return productKeyBySlugPrefix + slug
}

func (c *productRedisCache) GetByID(ctx context.Context, id uuid.UUID) (*entity.Product, error) {
	return c.get(ctx, productKeyByID(id))
}

func (c *productRedisCache) GetBySlug(ctx context.Context, slug string) (*entity.Product, error) {
	return c.get(ctx, productKeyBySlug(slug))
}

func (c *productRedisCache) get(ctx context.Context, key string) (*entity.Product, error) {
	if c.client == nil {
		c.logRedisDown("get", key)
		return nil, nil
	}

	raw, err := pkgcache.Get[string](ctx, c.client, key)
	if err != nil {
		if isCacheMiss(err) {
			return nil, nil
		}
		c.logRedisDown("get", key)
		return nil, nil
	}

	product, err := decodeProduct(raw)
	if err != nil {
		if c.log != nil {
			c.log.Warn().Str("key", key).Err(err).Msg("product cache decode failed")
		}
		return nil, nil
	}
	return product, nil
}

func (c *productRedisCache) Set(ctx context.Context, product *entity.Product, ttl time.Duration) error {
	if product == nil {
		return nil
	}
	if c.client == nil {
		c.logRedisDown("set", productKeyByID(product.ID))
		return nil
	}

	payload, err := json.Marshal(product)
	if err != nil {
		return fmt.Errorf("encode product cache value: %w", err)
	}

	items := map[string]string{
		productKeyByID(product.ID):     string(payload),
		productKeyBySlug(product.Slug): string(payload),
	}

	if err := c.client.SetManyWithTTL(ctx, items, ttl); err != nil {
		c.logRedisDown("set", productKeyByID(product.ID))
		return err
	}
	return nil
}

func (c *productRedisCache) Invalidate(ctx context.Context, id uuid.UUID, slug string) error {
	if c.client == nil {
		c.logRedisDown("del", productKeyByID(id))
		return nil
	}

	keys := []string{productKeyByID(id)}
	if slug != "" {
		keys = append(keys, productKeyBySlug(slug))
	}

	if err := pkgcache.Del(ctx, c.client, keys...); err != nil {
		c.logRedisDown("del", productKeyByID(id))
		return err
	}
	return nil
}

func decodeProduct(raw string) (*entity.Product, error) {
	var product entity.Product
	if err := json.Unmarshal([]byte(raw), &product); err != nil {
		return nil, err
	}
	return &product, nil
}

func isCacheMiss(err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, pkgcache.ErrNotFound) {
		return true
	}
	appErr, ok := apperrors.IsAppError(err)
	return ok && appErr.Code == apperrors.ErrCodeNotFound
}

func (c *productRedisCache) logRedisDown(op, key string) {
	if c.log == nil {
		return
	}
	c.log.Warn().Str("operation", op).Str("key", key).Msg("redis unavailable, skipping cache")
}
