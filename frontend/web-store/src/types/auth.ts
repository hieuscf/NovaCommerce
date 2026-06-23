export type AuthUser = {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  status: string;
  created_at: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
};

export type LoginResponse = AuthTokens & {
  user: AuthUser;
};

export type RegisterResponse = {
  user: AuthUser;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  new_password: string;
};

export type UpdateProfilePayload = {
  full_name: string;
  phone: string;
  avatar_url?: string;
};
