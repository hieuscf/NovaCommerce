import { describe, expect, it } from 'vitest';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';

describe('BcryptPasswordHasher', () => {
  it('hashes and verifies password', async () => {
    const hasher = new BcryptPasswordHasher(1024);
    const hash = await hasher.hash('password123');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(await hasher.verify('password123', hash)).toBe(true);
    expect(await hasher.verify('wrong-password', hash)).toBe(false);
  });
});
