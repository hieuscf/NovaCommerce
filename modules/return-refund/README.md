# Return & Refund Module

**Bounded Context:** ReturnRefund

**Responsibility:** Return requests and refund coordination for completed orders.

**Dependencies / Communication:** Validates orders through `IOrderReturnValidationService`, processes refunds through `IPaymentRefundService`. Does not access Order or Payment aggregates directly.

## Return Status Lifecycle

| Status | Description |
|--------|-------------|
| `requested` | Return request created |
| `approved` | Return approved for refund |
| `rejected` | Return rejected |
| `refunded` | Payment refunded and return completed |

## Application Handlers

| Handler | Purpose |
|---------|---------|
| `CreateReturnRequestHandler` | Creates a return request for an eligible order |
| `ApproveReturnRequestHandler` | Approves a requested return |
| `RejectReturnRequestHandler` | Rejects a requested return |
| `ProcessReturnRefundHandler` | Refunds payment and marks return as refunded |

## Domain Events

- `ReturnRequested`
- `ReturnApproved`
- `ReturnRejected`
- `ReturnRefunded`

Events are persisted via Outbox when the return request aggregate is saved.

## API (Gateway)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/returns` | Create return request |
| POST | `/returns/:returnRequestId/approve` | Approve return |
| POST | `/returns/:returnRequestId/reject` | Reject return |
| POST | `/returns/:returnRequestId/refund` | Process refund |
