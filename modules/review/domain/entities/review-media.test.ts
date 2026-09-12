import { describe, expect, it } from 'vitest';
import { ReviewMedia } from './review-media';
import { ReviewDomainError } from '../errors/review-domain.error';

describe('ReviewMedia', () => {
  it('creates valid media', () => {
    const media = ReviewMedia.create('media-1', 'http://localhost/image.jpg', 'image/png');
    expect(media.getMediaType()).toBe('image/png');
  });

  it('rejects unsupported media types', () => {
    expect(() => ReviewMedia.create('media-1', 'http://localhost/image.gif', 'image/gif')).toThrow(
      ReviewDomainError,
    );
  });
});
