export type AuthStatus = 'unknown' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export type SessionReason = 'session_expired';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  readonly identityId: string;
  readonly email: string;
  readonly status: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface LogoutRequest {
  refreshToken?: string;
}

export interface SessionSnapshot {
  readonly status: AuthStatus;
  readonly isAuthenticated: boolean;
  readonly isSigningOut: boolean;
  readonly reason: SessionReason | null;
}

/**
 * Replaceable authentication transport. UI and session code depend on this
 * interface, not on a specific Gateway or development adapter.
 */
export interface IAuthClient {
  login(credentials: LoginRequest): Promise<AuthenticationResponse>;
  register(data: RegisterRequest): Promise<RegisterResponse>;
  logout(data?: LogoutRequest): Promise<void>;
  forgotPassword(data: ForgotPasswordRequest): Promise<void>;
  resetPassword(data: ResetPasswordRequest): Promise<void>;
}

export type AuthErrorKind =
  | 'invalid_credentials'
  | 'account_unavailable'
  | 'session_expired'
  | 'network'
  | 'server'
  | 'rate_limited'
  | 'conflict'
  | 'unknown';
