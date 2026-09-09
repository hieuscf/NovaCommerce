export interface SecurityContext {
  readonly userId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}
