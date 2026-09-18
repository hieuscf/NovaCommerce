import type { Role } from '../entities/role';

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
  save(role: Role): Promise<void>;
  delete(id: string): Promise<void>;
}
