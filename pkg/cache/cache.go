package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/redis/go-redis/v9"
)

const defaultPoolSize = 10

// ErrNotFound indicates a cache key does not exist.
var ErrNotFound = apperrors.NewNotFound("cache key not found")

// Config holds Redis client configuration.
type Config struct {
	Addr     string
	Password string
	DB       int
	PoolSize int
}

// Cache wraps a Redis client.
type Cache struct {
	client redisCmd
}

type redisCmd interface {
	Ping(ctx context.Context) *redis.StatusCmd
	Close() error
	Get(ctx context.Context, key string) *redis.StringCmd
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.StatusCmd
	Del(ctx context.Context, keys ...string) *redis.IntCmd
	Exists(ctx context.Context, keys ...string) *redis.IntCmd
	SetNX(ctx context.Context, key string, value interface{}, expiration time.Duration) *redis.BoolCmd
	Incr(ctx context.Context, key string) *redis.IntCmd
	Expire(ctx context.Context, key string, expiration time.Duration) *redis.BoolCmd
	MGet(ctx context.Context, keys ...string) *redis.SliceCmd
}

// New creates a Redis cache client.
func New(cfg Config) (*Cache, error) {
	if cfg.Addr == "" {
		return nil, fmt.Errorf("redis address is required")
	}
	if cfg.PoolSize <= 0 {
		cfg.PoolSize = defaultPoolSize
	}

	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
		PoolSize: cfg.PoolSize,
	})

	return &Cache{client: client}, nil
}

// newCacheWithClient creates a cache with a custom redis client implementation.
func newCacheWithClient(client redisCmd) *Cache {
	return &Cache{client: client}
}

// Close closes the Redis client.
func (c *Cache) Close() error {
	if c == nil || c.client == nil {
		return nil
	}
	return c.client.Close()
}

// Ping verifies Redis connectivity.
func (c *Cache) Ping(ctx context.Context) error {
	if c == nil || c.client == nil {
		return apperrors.NewInternal("cache client is not initialized")
	}
	if err := c.client.Ping(ctx).Err(); err != nil {
		return apperrors.NewInternal(fmt.Sprintf("redis ping failed: %v", err))
	}
	return nil
}

func marshalValue(value interface{}) (string, error) {
	switch v := value.(type) {
	case string:
		return v, nil
	case []byte:
		return string(v), nil
	default:
		raw, err := json.Marshal(value)
		if err != nil {
			return "", err
		}
		return string(raw), nil
	}
}

func unmarshalValue[T any](raw string) (T, error) {
	var zero T
	if raw == "" {
		return zero, ErrNotFound
	}

	var value T
	if err := json.Unmarshal([]byte(raw), &value); err != nil {
		if _, ok := any(zero).(string); ok {
			return any(raw).(T), nil
		}
		return zero, apperrors.NewInternal(fmt.Sprintf("failed to decode cache value: %v", err))
	}
	return value, nil
}

func mapRedisError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, redis.Nil) {
		return ErrNotFound
	}
	return apperrors.NewInternal(fmt.Sprintf("redis error: %v", err))
}

// Set stores a value with TTL.
func Set[T any](ctx context.Context, c *Cache, key string, value T, ttl time.Duration) error {
	if c == nil || c.client == nil {
		return apperrors.NewInternal("cache client is not initialized")
	}

	payload, err := marshalValue(value)
	if err != nil {
		return apperrors.NewInternal(fmt.Sprintf("failed to encode cache value: %v", err))
	}

	if err := c.client.Set(ctx, key, payload, ttl).Err(); err != nil {
		return mapRedisError(err)
	}
	return nil
}

// Get retrieves and decodes a cached value.
func Get[T any](ctx context.Context, c *Cache, key string) (T, error) {
	var zero T
	if c == nil || c.client == nil {
		return zero, apperrors.NewInternal("cache client is not initialized")
	}

	raw, err := c.client.Get(ctx, key).Result()
	if err != nil {
		return zero, mapRedisError(err)
	}
	return unmarshalValue[T](raw)
}

// Del removes one or more keys.
func Del(ctx context.Context, c *Cache, keys ...string) error {
	if c == nil || c.client == nil {
		return apperrors.NewInternal("cache client is not initialized")
	}
	if err := c.client.Del(ctx, keys...).Err(); err != nil {
		return mapRedisError(err)
	}
	return nil
}

// Exists checks whether a key exists.
func Exists(ctx context.Context, c *Cache, key string) (bool, error) {
	if c == nil || c.client == nil {
		return false, apperrors.NewInternal("cache client is not initialized")
	}

	count, err := c.client.Exists(ctx, key).Result()
	if err != nil {
		return false, mapRedisError(err)
	}
	return count > 0, nil
}

// SetNX stores a value only if the key does not exist.
func SetNX[T any](ctx context.Context, c *Cache, key string, value T, ttl time.Duration) (bool, error) {
	if c == nil || c.client == nil {
		return false, apperrors.NewInternal("cache client is not initialized")
	}

	payload, err := marshalValue(value)
	if err != nil {
		return false, apperrors.NewInternal(fmt.Sprintf("failed to encode cache value: %v", err))
	}

	created, err := c.client.SetNX(ctx, key, payload, ttl).Result()
	if err != nil {
		return false, mapRedisError(err)
	}
	return created, nil
}

// Incr increments a numeric key.
func Incr(ctx context.Context, c *Cache, key string) (int64, error) {
	if c == nil || c.client == nil {
		return 0, apperrors.NewInternal("cache client is not initialized")
	}

	value, err := c.client.Incr(ctx, key).Result()
	if err != nil {
		return 0, mapRedisError(err)
	}
	return value, nil
}

// Expire sets a TTL on an existing key.
func Expire(ctx context.Context, c *Cache, key string, ttl time.Duration) error {
	if c == nil || c.client == nil {
		return apperrors.NewInternal("cache client is not initialized")
	}

	if _, err := c.client.Expire(ctx, key, ttl).Result(); err != nil {
		return mapRedisError(err)
	}
	return nil
}

// MGet retrieves multiple keys, skipping missing entries.
func MGet[T any](ctx context.Context, c *Cache, keys []string) (map[string]T, error) {
	result := make(map[string]T)
	if c == nil || c.client == nil {
		return result, apperrors.NewInternal("cache client is not initialized")
	}
	if len(keys) == 0 {
		return result, nil
	}

	values, err := c.client.MGet(ctx, keys...).Result()
	if err != nil {
		return result, mapRedisError(err)
	}

	for i, key := range keys {
		if i >= len(values) || values[i] == nil {
			continue
		}

		raw, ok := values[i].(string)
		if !ok {
			continue
		}

		value, decodeErr := unmarshalValue[T](raw)
		if decodeErr != nil {
			return result, decodeErr
		}
		result[key] = value
	}

	return result, nil
}

type pipelineClient interface {
	Pipeline() redis.Pipeliner
}

// SetManyWithTTL stores multiple string values with the same TTL using a Redis pipeline.
func (c *Cache) SetManyWithTTL(ctx context.Context, items map[string]string, ttl time.Duration) error {
	if c == nil || c.client == nil {
		return apperrors.NewInternal("cache client is not initialized")
	}
	if len(items) == 0 {
		return nil
	}

	pc, ok := c.client.(pipelineClient)
	if !ok {
		for key, value := range items {
			if err := c.client.Set(ctx, key, value, ttl).Err(); err != nil {
				return mapRedisError(err)
			}
		}
		return nil
	}

	pipe := pc.Pipeline()
	for key, value := range items {
		pipe.Set(ctx, key, value, ttl)
	}
	if _, err := pipe.Exec(ctx); err != nil {
		return mapRedisError(err)
	}
	return nil
}
