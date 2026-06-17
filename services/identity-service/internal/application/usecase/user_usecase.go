package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/novacommerce/identity-service/internal/application/port"
	uservalidator "github.com/novacommerce/identity-service/internal/application/validator"
	"github.com/novacommerce/identity-service/internal/domain/entity"
	"github.com/novacommerce/identity-service/internal/domain/repository"
	apperrors "github.com/novacommerce/pkg/errors"
	"github.com/novacommerce/pkg/pagination"
	pkglogger "github.com/novacommerce/pkg/logger"
)

const eventUserUpdated = "USER_UPDATED"

// UserUseCase defines user profile management operations.
type UserUseCase interface {
	GetUser(ctx context.Context, id uuid.UUID) (*UserProfileOutput, error)
	UpdateProfile(ctx context.Context, id uuid.UUID, input UpdateProfileInput) (*UserProfileOutput, error)
	ListUsers(ctx context.Context, input ListUsersInput) (*ListUsersResult, error)
	UpdateUserStatus(ctx context.Context, actorID, targetID uuid.UUID, input UpdateUserStatusInput) (*UserProfileOutput, error)
	GetUserRoles(ctx context.Context, userID uuid.UUID) ([]RoleOutput, error)
	AssignRole(ctx context.Context, userID uuid.UUID, input AssignRoleInput) (*RoleOutput, error)
	RevokeRole(ctx context.Context, actorID, userID, roleID uuid.UUID) error
}

type userUseCase struct {
	userRepo   repository.UserRepository
	roleRepo   repository.RoleRepository
	outboxRepo repository.OutboxRepository
	transactor port.Transactor
}

// NewUserUseCase creates a UserUseCase with the given dependencies.
func NewUserUseCase(
	userRepo repository.UserRepository,
	roleRepo repository.RoleRepository,
	outboxRepo repository.OutboxRepository,
	transactor port.Transactor,
) UserUseCase {
	return &userUseCase{
		userRepo:   userRepo,
		roleRepo:   roleRepo,
		outboxRepo: outboxRepo,
		transactor: transactor,
	}
}

func (uc *userUseCase) GetUser(ctx context.Context, id uuid.UUID) (*UserProfileOutput, error) {
	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, wrapUserError("GetUser", err)
	}

	output := mapUserToProfileOutput(user)
	return &output, nil
}

func (uc *userUseCase) ListUsers(ctx context.Context, input ListUsersInput) (*ListUsersResult, error) {
	status, err := parseListUserStatus(input.Status)
	if err != nil {
		return nil, err
	}

	limit := input.Limit
	if limit <= 0 {
		limit = 20
	}

	filter := repository.UserFilter{
		Status: status,
		Role:   input.Role,
		Search: input.Search,
	}

	users, _, err := uc.userRepo.List(ctx, filter, input.Cursor, limit)
	if err != nil {
		return nil, wrapUserError("ListUsers", err)
	}

	items := make([]UserProfileOutput, 0, len(users))
	for _, user := range users {
		items = append(items, mapUserToProfileOutput(user))
	}

	var lastID string
	var lastCreatedAt time.Time
	if len(users) > 0 {
		last := users[len(users)-1]
		lastID = last.ID.String()
		lastCreatedAt = last.CreatedAt
	}

	pageResult := pagination.BuildResult(items, lastID, lastCreatedAt, 0, &pagination.CursorParams{
		Cursor: input.Cursor,
		Limit:  limit,
	})

	return &ListUsersResult{
		Users:      items,
		NextCursor: pageResult.NextCursor,
		HasMore:    pageResult.HasMore,
	}, nil
}

func parseListUserStatus(raw string) (*entity.UserStatus, error) {
	if raw == "" {
		return nil, nil
	}

	status := entity.UserStatus(raw)
	switch status {
	case entity.UserStatusActive, entity.UserStatusInactive, entity.UserStatusBanned, entity.UserStatus("pending_verification"):
		return &status, nil
	default:
		return nil, apperrors.NewBadRequest("invalid status")
	}
}

func (uc *userUseCase) UpdateProfile(ctx context.Context, id uuid.UUID, input UpdateProfileInput) (*UserProfileOutput, error) {
	if err := uservalidator.ValidateUpdateProfileInput(input.FullName, input.Phone, input.AvatarURL); err != nil {
		return nil, err
	}

	user, err := uc.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, wrapUserError("UpdateProfile", err)
	}

	if input.FullName != nil {
		user.FullName = *input.FullName
	}
	if input.Phone != nil {
		user.Phone = *input.Phone
	}
	if input.AvatarURL != nil {
		user.AvatarURL = *input.AvatarURL
	}

	err = uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		if err := uc.userRepo.Update(txCtx, user); err != nil {
			return err
		}
		return uc.writeUserUpdatedEvent(txCtx, user)
	})
	if err != nil {
		return nil, wrapUserError("UpdateProfile", err)
	}

	output := mapUserToProfileOutput(user)
	return &output, nil
}

func (uc *userUseCase) UpdateUserStatus(ctx context.Context, actorID, targetID uuid.UUID, input UpdateUserStatusInput) (*UserProfileOutput, error) {
	status, err := uservalidator.ParseUpdateUserStatus(input.Status)
	if err != nil {
		return nil, err
	}

	if status == entity.UserStatusInactive && actorID == targetID {
		return nil, apperrors.NewValidation("admin cannot disable their own account", nil)
	}

	var updated *entity.User
	err = uc.transactor.WithTransaction(ctx, func(txCtx context.Context) error {
		user, err := uc.userRepo.UpdateStatus(txCtx, targetID, status)
		if err != nil {
			return err
		}
		if err := uc.writeUserUpdatedEvent(txCtx, user); err != nil {
			return err
		}
		updated = user
		return nil
	})
	if err != nil {
		return nil, wrapUserError("UpdateUserStatus", err)
	}

	output := mapUserToProfileOutput(updated)
	return &output, nil
}

func (uc *userUseCase) GetUserRoles(ctx context.Context, userID uuid.UUID) ([]RoleOutput, error) {
	if _, err := uc.userRepo.FindByID(ctx, userID); err != nil {
		return nil, wrapUserError("GetUserRoles", err)
	}

	roles, err := uc.roleRepo.GetUserRoles(ctx, userID)
	if err != nil {
		return nil, wrapUserError("GetUserRoles", err)
	}

	return mapRolesToOutput(roles), nil
}

func (uc *userUseCase) AssignRole(ctx context.Context, userID uuid.UUID, input AssignRoleInput) (*RoleOutput, error) {
	if _, err := uc.userRepo.FindByID(ctx, userID); err != nil {
		return nil, wrapUserError("AssignRole", err)
	}

	exists, err := uc.roleRepo.RoleExists(ctx, input.RoleID)
	if err != nil {
		return nil, wrapUserError("AssignRole", err)
	}
	if !exists {
		return nil, apperrors.NewNotFound("role not found")
	}

	role, err := uc.roleRepo.FindByID(ctx, input.RoleID)
	if err != nil {
		return nil, wrapUserError("AssignRole", err)
	}

	if err := uc.roleRepo.AssignRole(ctx, userID, input.RoleID); err != nil {
		return nil, wrapUserError("AssignRole", err)
	}

	output := mapRoleToOutput(role)
	return &output, nil
}

func (uc *userUseCase) RevokeRole(ctx context.Context, actorID, userID, roleID uuid.UUID) error {
	if _, err := uc.userRepo.FindByID(ctx, userID); err != nil {
		return wrapUserError("RevokeRole", err)
	}

	uc.warnIfRevokingLastAdmin(ctx, actorID, userID, roleID)

	if err := uc.roleRepo.RevokeRole(ctx, userID, roleID); err != nil {
		return wrapUserError("RevokeRole", err)
	}
	return nil
}

// warnIfRevokingLastAdmin logs when the sole system admin revokes their own admin role.
// TODO(SVC-IS-005): Enforce lockout guard (block revoke or require break-glass approval)
// when removing the last admin assignment system-wide.
func (uc *userUseCase) warnIfRevokingLastAdmin(ctx context.Context, actorID, userID, roleID uuid.UUID) {
	if actorID != userID {
		return
	}

	role, err := uc.roleRepo.FindByID(ctx, roleID)
	if err != nil || role.Name != "admin" {
		return
	}

	count, err := uc.roleRepo.CountUsersWithRole(ctx, roleID)
	if err != nil || count > 1 {
		return
	}

	log := pkglogger.FromContext(ctx)
	if log != nil {
		log.Warn().
			Str("user_id", userID.String()).
			Str("role_id", roleID.String()).
			Msg("revoking admin role from the only system admin; lockout guard not yet enforced")
	}
}

type userUpdatedPayload struct {
	Type      string    `json:"type"`
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	Timestamp time.Time `json:"timestamp"`
}

func (uc *userUseCase) writeUserUpdatedEvent(ctx context.Context, user *entity.User) error {
	raw, err := json.Marshal(userUpdatedPayload{
		Type:      eventUserUpdated,
		UserID:    user.ID,
		Email:     user.Email,
		Timestamp: time.Now().UTC(),
	})
	if err != nil {
		return fmt.Errorf("userUseCase: marshal user updated event: %w", err)
	}

	event := &entity.OutboxEvent{
		ID:        uuid.New(),
		Topic:     topicUserEvents,
		Key:       user.ID.String(),
		Payload:   raw,
		CreatedAt: time.Now().UTC(),
	}
	if err := uc.outboxRepo.Create(ctx, event); err != nil {
		return fmt.Errorf("userUseCase: persist outbox event: %w", err)
	}
	return nil
}

func mapUserToProfileOutput(user *entity.User) UserProfileOutput {
	return UserProfileOutput{
		ID:          user.ID.String(),
		Username:    user.Username,
		Email:       user.Email,
		FullName:    user.FullName,
		Phone:       user.Phone,
		AvatarURL:   user.AvatarURL,
		Status:      string(user.Status),
		LastLoginAt: user.LastLoginAt,
		CreatedAt:   user.CreatedAt,
		UpdatedAt:   user.UpdatedAt,
	}
}

func mapRolesToOutput(roles []*entity.Role) []RoleOutput {
	output := make([]RoleOutput, 0, len(roles))
	for _, role := range roles {
		output = append(output, mapRoleToOutput(role))
	}
	return output
}

func mapRoleToOutput(role *entity.Role) RoleOutput {
	return RoleOutput{
		ID:          role.ID.String(),
		Name:        role.Name,
		DisplayName: role.DisplayName,
		Description: role.Description,
		IsSystem:    role.IsSystem,
		CreatedAt:   role.CreatedAt,
	}
}

func wrapUserError(method string, err error) error {
	if _, ok := apperrors.IsAppError(err); ok {
		return err
	}
	return fmt.Errorf("userUseCase.%s: %w", method, err)
}
