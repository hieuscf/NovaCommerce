import { describe, expect, it } from 'vitest';
import { PreferenceKey } from './preference-key';

describe('PreferenceKey', () => {
  it('accepts supported keys', () => {
    expect(PreferenceKey.create('language').value).toBe('language');
  });

  it('rejects unsupported keys', () => {
    expect(() => PreferenceKey.create('unknown.key')).toThrow('Unsupported preference key');
  });
});
