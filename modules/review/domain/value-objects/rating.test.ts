import { describe, expect, it } from 'vitest';
import { Rating } from './rating';
import { ReviewDomainError } from '../errors/review-domain.error';

describe('Rating', () => {
  it('accepts values between 1 and 5', () => {
    expect(Rating.create(1).value).toBe(1);
    expect(Rating.create(5).value).toBe(5);
  });

  it('rejects invalid ratings', () => {
    expect(() => Rating.create(0)).toThrow(ReviewDomainError);
    expect(() => Rating.create(6)).toThrow(ReviewDomainError);
  });
});
