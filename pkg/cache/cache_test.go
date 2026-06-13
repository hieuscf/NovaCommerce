package cache

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/go-redis/redismock/v9"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/redis/go-redis/v9"
)

type testUser struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

func newTestCache(t *testing.T) (*Cache, redismock.ClientMock) {
	t.Helper()

	client, mock := redismock.NewClientMock()
	return newCacheWithClient(client), mock
}

func TestGetExistingKey(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectGet("user:1").SetVal(`{"id":"1","name":"Alice"}`)

	user, err := Get[testUser](ctx, cache, "user:1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if user.Name != "Alice" {
		t.Fatalf("unexpected user: %#v", user)
	}
}

func TestGetMissingKey(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectGet("missing").SetErr(redis.Nil)

	_, err := Get[string](ctx, cache, "missing")
	appErr, ok := apperrors.IsAppError(err)
	if !ok || appErr.Code != apperrors.ErrCodeNotFound {
		t.Fatalf("expected not found error, got %v", err)
	}
}

func TestGetStringValue(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectGet("token").SetVal("abc123")

	value, err := Get[string](ctx, cache, "token")
	if err != nil || value != "abc123" {
		t.Fatalf("unexpected result: %v err=%v", value, err)
	}
}

func TestSetAndDel(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectSet("key", `{"id":"1","name":"Bob"}`, time.Minute).SetVal("OK")
	mock.ExpectDel("key").SetVal(1)

	if err := Set(ctx, cache, "key", testUser{ID: "1", Name: "Bob"}, time.Minute); err != nil {
		t.Fatalf("set failed: %v", err)
	}
	if err := Del(ctx, cache, "key"); err != nil {
		t.Fatalf("del failed: %v", err)
	}
}

func TestSetNX(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectSetNX("lock", "1", time.Minute).SetVal(true)
	created, err := SetNX(ctx, cache, "lock", "1", time.Minute)
	if err != nil || !created {
		t.Fatalf("expected created=true, got %v err=%v", created, err)
	}

	mock.ExpectSetNX("lock", "2", time.Minute).SetVal(false)
	created, err = SetNX(ctx, cache, "lock", "2", time.Minute)
	if err != nil || created {
		t.Fatalf("expected created=false, got %v err=%v", created, err)
	}
}

func TestMGetPartialHit(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectMGet("a", "b").SetVal([]interface{}{`"alpha"`, nil})

	values, err := MGet[string](ctx, cache, []string{"a", "b"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(values) != 1 || values["a"] != "alpha" {
		t.Fatalf("unexpected values: %#v", values)
	}
}

func TestExistsIncrExpire(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	mock.ExpectExists("counter").SetVal(1)
	mock.ExpectIncr("counter").SetVal(2)
	mock.ExpectExpire("counter", time.Minute).SetVal(true)

	exists, err := Exists(ctx, cache, "counter")
	if err != nil || !exists {
		t.Fatalf("expected key to exist, got exists=%v err=%v", exists, err)
	}

	value, err := Incr(ctx, cache, "counter")
	if err != nil || value != 2 {
		t.Fatalf("unexpected incr result: %d err=%v", value, err)
	}

	if err := Expire(ctx, cache, "counter", time.Minute); err != nil {
		t.Fatalf("expire failed: %v", err)
	}
}

func TestGenericSliceType(t *testing.T) {
	cache, mock := newTestCache(t)
	ctx := context.Background()

	payload, _ := json.Marshal([]string{"a", "b"})
	mock.ExpectGet("tags").SetVal(string(payload))

	tags, err := Get[[]string](ctx, cache, "tags")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(tags) != 2 || tags[0] != "a" {
		t.Fatalf("unexpected tags: %#v", tags)
	}
}

func TestNewRequiresAddress(t *testing.T) {
	if _, err := New(Config{}); err == nil {
		t.Fatal("expected error for empty address")
	}
}

func TestNilCacheOperations(t *testing.T) {
	var cache *Cache
	ctx := context.Background()

	if _, err := Get[string](ctx, cache, "key"); err == nil {
		t.Fatal("expected error for nil cache get")
	}
	if err := Set(ctx, cache, "key", "value", time.Minute); err == nil {
		t.Fatal("expected error for nil cache set")
	}
}

func TestErrNotFoundSentinel(t *testing.T) {
	appErr, ok := apperrors.IsAppError(ErrNotFound)
	if !ok || appErr.Code != apperrors.ErrCodeNotFound {
		t.Fatal("expected ErrNotFound to be not found app error")
	}
}

func TestPingSuccess(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectPing().SetVal("PONG")

	if err := cache.Ping(context.Background()); err != nil {
		t.Fatalf("unexpected ping error: %v", err)
	}
}

func TestPingFailure(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectPing().SetErr(errors.New("connection refused"))

	if err := cache.Ping(context.Background()); err == nil {
		t.Fatal("expected ping error")
	}
}

func TestCloseClient(t *testing.T) {
	client, _ := redismock.NewClientMock()
	cache := newCacheWithClient(client)
	if err := cache.Close(); err != nil {
		t.Fatalf("unexpected close error: %v", err)
	}
}

func TestMGetEmptyKeys(t *testing.T) {
	cache, _ := newTestCache(t)
	values, err := MGet[string](context.Background(), cache, nil)
	if err != nil || len(values) != 0 {
		t.Fatalf("expected empty result, got %#v err=%v", values, err)
	}
}

func TestSetRedisError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectSet("key", "value", time.Minute).SetErr(errors.New("write failed"))

	if err := Set(context.Background(), cache, "key", "value", time.Minute); err == nil {
		t.Fatal("expected set error")
	}
}

func TestGetInvalidJSONForStruct(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectGet("user:1").SetVal(`not-json`)

	_, err := Get[testUser](context.Background(), cache, "user:1")
	if err == nil {
		t.Fatal("expected decode error")
	}
}

func TestDelRedisError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectDel("key").SetErr(errors.New("del failed"))

	if err := Del(context.Background(), cache, "key"); err == nil {
		t.Fatal("expected del error")
	}
}

func TestExistsFalse(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectExists("missing").SetVal(0)

	exists, err := Exists(context.Background(), cache, "missing")
	if err != nil || exists {
		t.Fatalf("expected missing key, exists=%v err=%v", exists, err)
	}
}

func TestExistsError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectExists("key").SetErr(errors.New("exists failed"))

	if _, err := Exists(context.Background(), cache, "key"); err == nil {
		t.Fatal("expected exists error")
	}
}

func TestIncrError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectIncr("counter").SetErr(errors.New("incr failed"))

	if _, err := Incr(context.Background(), cache, "counter"); err == nil {
		t.Fatal("expected incr error")
	}
}

func TestExpireError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectExpire("key", time.Minute).SetErr(errors.New("expire failed"))

	if err := Expire(context.Background(), cache, "key", time.Minute); err == nil {
		t.Fatal("expected expire error")
	}
}

func TestMGetRedisError(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectMGet("a").SetErr(errors.New("mget failed"))

	if _, err := MGet[string](context.Background(), cache, []string{"a"}); err == nil {
		t.Fatal("expected mget error")
	}
}

func TestSetByteValue(t *testing.T) {
	cache, mock := newTestCache(t)
	mock.ExpectSet("raw", "hello", time.Minute).SetVal("OK")

	if err := Set(context.Background(), cache, "raw", []byte("hello"), time.Minute); err != nil {
		t.Fatalf("unexpected set error: %v", err)
	}
}

func TestNilCacheClose(t *testing.T) {
	var cache *Cache
	if err := cache.Close(); err != nil {
		t.Fatalf("unexpected close error: %v", err)
	}
}
