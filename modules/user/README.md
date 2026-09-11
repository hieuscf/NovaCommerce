# User Module

**Bounded Context:** User

**Responsibility:** Customer and user profile management — profiles, addresses, and preferences.

**Dependencies / Communication:** References Identity via `identity_id` (logical FK). Publishes `UserCreated` and `UserProfileUpdated` via Outbox. No direct access to other modules' domain or database.

## Domain

- **Aggregate Root:** `User`
- **Entities:** `UserProfile`, `UserAddress`, `UserPreference`
- **Value Objects:** `UserId`, `DisplayName`, `PhoneNumber`, `Address`, `PreferenceKey`
- **Events:** `UserCreated`, `UserProfileUpdated`

## Application Handlers

| Handler | Purpose |
|---------|---------|
| `CreateCustomerProfileHandler` | Create customer profile linked to identity |
| `GetCustomerProfileHandler` | Read profile by identity |
| `GetCustomerAccountHandler` | Account summary (profile + counts) |
| `UpdateCustomerProfileHandler` | Update display name, phone, avatar |
| `GetCustomerAddressesHandler` | List addresses |
| `AddAddressHandler` | Add address |
| `UpdateAddressHandler` | Update address |
| `RemoveAddressHandler` | Remove address |
| `SetDefaultAddressHandler` | Set default address |
| `GetCustomerPreferencesHandler` | List preferences |
| `UpdateCustomerPreferencesHandler` | Upsert preferences |

## API (Gateway)

All routes require JWT authentication. Identity is resolved from token (`SecurityContext.userId` → `identity_id`).

| Method | Path |
|--------|------|
| POST | `/api/v1/users/me` |
| GET | `/api/v1/users/me` |
| GET | `/api/v1/users/me/account` |
| PATCH | `/api/v1/users/me` |
| GET | `/api/v1/users/me/addresses` |
| POST | `/api/v1/users/me/addresses` |
| PATCH | `/api/v1/users/me/addresses/:addressId` |
| DELETE | `/api/v1/users/me/addresses/:addressId` |
| POST | `/api/v1/users/me/addresses/:addressId/default` |
| GET | `/api/v1/users/me/preferences` |
| PATCH | `/api/v1/users/me/preferences` |
