NovaCommerce API Guidelines

> **Version:** 1.0  
> **Status:** Foundation Standard  
> **Architecture:** API First + Clean Architecture + DDD + Event Driven

## 1. Mục tiêu

API của NovaCommerce phải nhất quán, dễ sử dụng, an toàn và có khả năng mở rộng từ Modular Monolith sang Microservices mà không thay đổi Domain Logic.

Nguyên tắc chính:

- REST-first cho public/client API.
- OpenAPI/Swagger là contract chính.
- API không chứa Business Logic.
- Module chỉ expose Public Contract, không expose Entity nội bộ.
- Versioning ngay từ đầu.
- Chuẩn hóa response, error, pagination và filtering.
- Hỗ trợ Idempotency cho các operation nhạy cảm.
- Correlation ID / Request ID xuyên suốt request và event flow.

## 2. API Architecture

```text
Client
  ↓
API Gateway / BFF
  ↓
Module Presentation
  ↓
Application
  ↓
Domain

Gateway chịu trách nhiệm cho các concern dùng chung:

Authentication
Authorization
Rate Limiting
Request ID / Correlation ID
Logging
Response boundary

Controller chỉ nhận request, validate DTO và gọi Application Use Case.

3. URL & Versioning

Base path:

/api/v1

Resource dùng danh từ số nhiều:

GET    /api/v1/products
GET    /api/v1/products/{productId}
POST   /api/v1/products
PATCH  /api/v1/products/{productId}
DELETE /api/v1/products/{productId}

Quy tắc:

lowercase.
kebab-case khi cần nhiều từ.
Không dùng verb trong resource path nếu có thể biểu diễn bằng HTTP method.
Không expose tên Entity/Database table nội bộ.
Breaking change phải tạo API version mới.
4. HTTP Methods
Method	Mục đích
GET	Read
POST	Create / command
PUT	Replace toàn bộ resource
PATCH	Partial update
DELETE	Delete / deactivate

Không dùng GET để thay đổi state.

5. HTTP Status Codes
Status	Sử dụng
200	Successful read/update
201	Resource created
202	Accepted, xử lý async
204	Success không có response body
400	Invalid request
401	Unauthenticated
403	Forbidden
404	Resource không tồn tại
409	Conflict
422	Business validation error
429	Rate limited
500	Unexpected server error
503	Service unavailable
6. Response Format

Response thành công nên có cấu trúc nhất quán.

{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}

Collection:

{
  "data": [],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "requestId": "..."
  }
}

Không trả trực tiếp database record.

7. Error Format

Business/API error dùng Error Code ổn định.

{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found",
    "details": {},
    "requestId": "..."
  }
}

Quy tắc:

Client xử lý theo code, không dựa vào message.
Không expose stack trace.
Không expose SQL, internal exception hoặc secret.
Business error không dùng generic 500.
Validation error phải chỉ rõ field khi phù hợp.

Application/Domain có thể dùng Result Pattern theo architecture; Presentation map Result/Domain Error sang HTTP response.

8. Pagination

Mặc định hỗ trợ pagination cho collection lớn.

Offset pagination:

GET /api/v1/products?page=1&pageSize=20

Quy tắc:

pageSize có giới hạn tối đa.
Không cho client yêu cầu page size vô hạn.
Resource có lượng dữ liệu rất lớn có thể chuyển sang cursor pagination.

Cursor:

GET /api/v1/products?cursor=...&limit=20
9. Filtering, Sorting & Search

Ví dụ:

GET /api/v1/products?status=active
GET /api/v1/products?sort=-createdAt,name
GET /api/v1/products?categoryId=...

Search phức tạp thuộc Search module và OpenSearch, không query trực tiếp PostgreSQL từ API.

10. Authentication & Authorization

API phải hỗ trợ:

JWT
Refresh Token
OAuth2 / OIDC khi cần
RBAC
ABAC khi cần

Authorization phải được kiểm tra tại Application boundary và/hoặc policy/guard phù hợp.

Không tin tưởng userId, role hoặc permission do client tự gửi.

11. Idempotency

Các operation có side effect quan trọng nên hỗ trợ:

Idempotency-Key: <unique-key>

Đặc biệt:

Create Order
Payment
Refund
Checkout
Các command có khả năng retry

Retry không được tạo duplicate business operation.

12. Request Validation

Mọi input từ client phải được validate tại Presentation layer.

Không đưa DTO trực tiếp vào Domain.

Quy tắc:

Reject input không hợp lệ.
Giới hạn kích thước payload.
Validate enum, format, range và required fields.
Không dùng any để bypass validation.
13. API Contract

Mọi API mới phải:

Có DTO request/response.
Có OpenAPI/Swagger documentation.
Có HTTP status codes rõ ràng.
Có error codes.
Có authentication/authorization requirement.
Có Unit Test và Integration Test phù hợp.

OpenAPI là contract giữa client và server.

14. Module Boundary

Module không được truy cập trực tiếp:

Order → InventoryRepository   ❌

Thay vào đó:

Order
  ↓
Application Contract / Event
  ↓
Inventory

Public Contract của module phải ổn định và không leak implementation detail.

15. Events & API

API command có thể tạo Domain Event.

Ví dụ:

POST /api/v1/orders
        ↓
CreateOrder Use Case
        ↓
OrderCreated
        ↓
Outbox

Không publish integration event trực tiếp từ Controller.

Transaction phải đảm bảo business state và Outbox được commit cùng nhau.

16. Long-running Operations

Operation xử lý lâu nên trả:

202 Accepted

và cung cấp resource/status để client theo dõi khi cần.

Không giữ HTTP request mở chỉ để chờ background processing.

17. Security

API phải:

HTTPS trong môi trường production.
Rate limiting tại Gateway.
CORS cấu hình theo environment.
Helmet/security headers.
Không log token, password, secret hoặc dữ liệu nhạy cảm không cần thiết.
Giới hạn request body.
Audit các operation quan trọng.
18. Observability

Mỗi request nên có:

RequestId
CorrelationId
UserId (nếu authenticated)
Module
Action
Duration
ErrorCode

Correlation ID phải được truyền tiếp qua các boundary cần thiết, bao gồm background processing/event flow.

19. API Design cho Microservices

API hiện tại có thể chạy qua Modular Monolith nhưng phải tránh coupling vào monolith.

Khi tách service:

Gateway
  ↓
Service API
  ↓
Application
  ↓
Domain

Domain Contract không phụ thuộc transport.

REST/gRPC/Kafka chỉ là infrastructure/communication mechanism.

20. Naming Conventions
JSON fields: camelCase.
IDs: ưu tiên tên rõ nghĩa như productId, orderId.
Date/time: ISO 8601.
Boolean: dùng tên thể hiện trạng thái, ví dụ isActive.
Error code: UPPER_SNAKE_CASE.
Enum value phải ổn định và documented.
21. Compatibility

Ưu tiên backward compatibility.

Không breaking change tùy tiện với:

Field đã public.
Enum đang được client sử dụng.
Response contract.
Error code.

Khi cần breaking change, tạo version mới và có migration/deprecation plan.

22. Checklist API mới

Trước khi merge:

 Thuộc đúng module/bounded context.
 Resource/operation được đặt tên nhất quán.
 DTO request/response rõ ràng.
 Validation đầy đủ.
 Authentication/authorization xác định.
 HTTP status codes xác định.
 Error codes xác định.
 Pagination/filtering nếu cần.
 Idempotency nếu có side effect/retry.
 OpenAPI/Swagger cập nhật.
 Không leak Entity/ORM model.
 Không truy cập Database module khác.
 Event/Outbox được xử lý đúng nếu có side effect liên module.
 Tests được bổ sung.
23. Quy tắc cốt lõi

API là Contract, không phải Domain.

API chỉ là boundary của hệ thống. Business rules nằm trong Application/Domain; Infrastructure không được leak ra public API.

Thiết kế API phải giữ được ba mục tiêu:

Stable Contract → Low Coupling → Microservices Ready
```
