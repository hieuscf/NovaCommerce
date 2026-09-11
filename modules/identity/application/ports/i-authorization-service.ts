export interface IAuthorizationService {
  getPermissionsForIdentity(identityId: string): Promise<string[]>;
  getRolesForIdentity(identityId: string): Promise<string[]>;
  can(identityId: string, permission: string): Promise<boolean>;
}
