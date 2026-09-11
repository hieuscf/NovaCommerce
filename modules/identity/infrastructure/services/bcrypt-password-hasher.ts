import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { IPasswordHasher } from '../../application/ports/i-password-hasher';

const ALGORITHM = 'scrypt';
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

export class BcryptPasswordHasher implements IPasswordHasher {
  constructor(private readonly costFactor: number = 16384) {}

  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH, {
      N: this.costFactor,
      r: 8,
      p: 1,
    });
    return `${ALGORITHM}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
  }

  async verify(plainPassword: string, passwordHash: string): Promise<boolean> {
    const [algorithm, saltHex, keyHex] = passwordHash.split('$');
    if (algorithm !== ALGORITHM || !saltHex || !keyHex) {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const storedKey = Buffer.from(keyHex, 'hex');
    const derivedKey = scryptSync(plainPassword, salt, storedKey.length, {
      N: this.costFactor,
      r: 8,
      p: 1,
    });

    if (storedKey.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedKey, derivedKey);
  }
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
