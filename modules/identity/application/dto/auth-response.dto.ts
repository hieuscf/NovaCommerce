export interface AuthenticationResponseDto {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly refreshToken: string;
}

export interface RegisterResponseDto {
  readonly identityId: string;
  readonly email: string;
  readonly status: string;
}
