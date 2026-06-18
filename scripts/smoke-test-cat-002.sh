#!/usr/bin/env bash
# Smoke test checklist for SVC-CAT-002 (Catalog Service Product CRUD + Outbox).
# Prerequisites: catalog-service running on :8082, Postgres/Redis/Kafka up, seeded category.
set -euo pipefail

BASE_URL="${CATALOG_BASE_URL:-http://localhost:8082}"
SELLER_ID="${SMOKE_SELLER_ID:-11111111-1111-4111-8111-111111111111}"
OTHER_SELLER_ID="${SMOKE_OTHER_SELLER_ID:-22222222-2222-4222-8222-222222222222}"
CUSTOMER_ID="${SMOKE_CUSTOMER_ID:-33333333-3333-4333-8333-333333333333}"
CATEGORY_ID="${SMOKE_CATEGORY_ID:-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa}"

pass() { echo "[PASS] $*"; }
fail() { echo "[FAIL] $*" >&2; exit 1; }

status_code() {
  curl -s -o /dev/null -w "%{http_code}" "$@"
}

echo "=== SVC-CAT-002 smoke test against ${BASE_URL} ==="

# 1. Health check
HEALTH=$(curl -s "${BASE_URL}/health")
echo "$HEALTH" | grep -q '"status":"ok"' || fail "health status not ok: $HEALTH"
echo "$HEALTH" | grep -q '"postgres":"ok"' || fail "postgres not ok"
echo "$HEALTH" | grep -q '"redis":"ok"' || fail "redis not ok"
echo "$HEALTH" | grep -q '"kafka":"ok"' || fail "kafka not ok"
pass "GET /health → 200, all dependencies ok"

# 2. POST without auth → 401
CODE=$(status_code -X POST "${BASE_URL}/api/v1/products" \
  -H "Content-Type: application/json" \
  -d '{}')
[[ "$CODE" == "401" ]] || fail "expected 401 without auth, got $CODE"
pass "POST /api/v1/products without auth → 401"

# 3. POST with customer role → 403
CODE=$(status_code -X POST "${BASE_URL}/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: ${CUSTOMER_ID}" \
  -H "X-User-Role: customer" \
  -d '{"name":"Test","category_id":"'"${CATEGORY_ID}"'","variants":[{"sku":"SKU-1","price":99}]}')
[[ "$CODE" == "403" ]] || fail "expected 403 for customer, got $CODE"
pass "POST /api/v1/products with customer token → 403"

# 4. POST with seller → 201
CREATE_BODY=$(cat <<EOF
{
  "name": "Smoke Test Product",
  "description": "Created by smoke-test-cat-002.sh",
  "category_id": "${CATEGORY_ID}",
  "variants": [{"sku": "SMOKE-SKU-$(date +%s)", "price": 99.99}]
}
EOF
)
CREATE_RESP=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/v1/products" \
  -H "Content-Type: application/json" \
  -H "X-User-ID: ${SELLER_ID}" \
  -H "X-User-Role: seller" \
  -d "$CREATE_BODY")
HTTP_CODE=$(echo "$CREATE_RESP" | tail -n1)
BODY=$(echo "$CREATE_RESP" | sed '$d')
[[ "$HTTP_CODE" == "201" ]] || fail "expected 201 create, got $HTTP_CODE: $BODY"
PRODUCT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[[ -n "$PRODUCT_ID" ]] || fail "product id missing in response"
pass "POST /api/v1/products with seller → 201 (id=${PRODUCT_ID})"

echo ""
echo "Manual checks (require psql/redis logs):"
echo "  - outbox_events: pending row with topic=product-events for product ${PRODUCT_ID}"
echo "  - wait ~2s → status should become sent"
echo "  - GET /api/v1/products/${PRODUCT_ID} twice (1st DB, 2nd Redis cache)"
echo "  - PUT /api/v1/products/${PRODUCT_ID} then GET again (cache invalidated)"
echo "  - GET /api/v1/products?category_id=${CATEGORY_ID}&min_price=50"
echo "  - POST variant with duplicate SKU → 409"
echo "  - DELETE with other seller (${OTHER_SELLER_ID}) → 403"
echo ""
pass "automated smoke checks complete — run manual DB/cache steps above"
