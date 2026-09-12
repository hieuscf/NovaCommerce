import { describe, expect, it, vi } from 'vitest';
import { MinioReviewImageStorage } from './minio-review-image-storage';

describe('MinioReviewImageStorage', () => {
  it('uploads review image and returns public url', async () => {
    const storage = new MinioReviewImageStorage(
      {
        upload: vi.fn().mockResolvedValue({
          key: 'reviews/review-1/media-1',
          bucket: 'novacommerce',
        }),
      },
      'http://localhost:9000',
    );

    const result = await storage.upload({
      reviewId: 'review-1',
      mediaId: 'media-1',
      content: new Uint8Array([1, 2, 3]),
      contentType: 'image/jpeg',
    });

    expect(result.url).toBe('http://localhost:9000/novacommerce/reviews/review-1/media-1');
    expect(result.mediaType).toBe('image/jpeg');
  });
});
