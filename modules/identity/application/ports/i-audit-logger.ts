export const AUDIT_ACTIONS = [
  'REGISTER',
  'LOGIN_SUCCESS',
  'LOGIN_FAILURE',
  'LOGOUT',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED',
  'REFRESH_TOKEN_ROTATED',
  'REFRESH_TOKEN_REVOKED',
  'ROLE_ASSIGNED',
  'ROLE_REMOVED',
  'PERMISSION_CHANGED',
  'OAUTH_LOGIN',
  'ACCOUNT_LOCKED',
  'ACCOUNT_UNLOCKED',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLogEntry {
  readonly actorId?: string;
  readonly action: AuditAction;
  readonly resource: string;
  readonly resourceId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface IAuditLogger {
  log(entry: AuditLogEntry): Promise<void>;
}
