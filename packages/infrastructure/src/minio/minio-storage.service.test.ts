import { AvailabilityError } from '@novacommerce/building-blocks';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const objectStore = new Map<string, Buffer>();

const mockMinioClient = {
  bucketExists: vi.fn(async () => false),
  makeBucket: vi.fn(async () => undefined),
  listBuckets: vi.fn(async () => []),
  putObject: vi.fn(async (bucket: string, key: string, body: Buffer) => {
    objectStore.set(`${bucket}/${key}`, body);
    return { etag: 'etag-1' };
  }),
  getObject: vi.fn(async (bucket: string, key: string) => {
    const value = objectStore.get(`${bucket}/${key}`);

    if (!value) {
      const error = new Error('Not Found');
      error.name = 'NotFound';
      throw error;
    }

    return {
      on(event: string, handler: (chunk?: Buffer) => void) {
        if (event === 'data') {
          handler(value);
        }

        if (event === 'end') {
          handler();
        }
      },
    };
  }),
  removeObject: vi.fn(async (bucket: string, key: string) => {
    objectStore.delete(`${bucket}/${key}`);
  }),
  statObject: vi.fn(async (bucket: string, key: string) => {
    if (!objectStore.has(`${bucket}/${key}`)) {
      const error = new Error('Not Found');
      error.name = 'NotFound';
      throw error;
    }

    return { size: objectStore.get(`${bucket}/${key}`)?.length ?? 0 };
  }),
};

vi.mock('minio', () => ({
  Client: vi.fn(() => mockMinioClient),
}));

import { MinioStorageService } from './minio-storage.service';

describe('MinioStorageService', () => {
  beforeEach(() => {
    objectStore.clear();
    vi.clearAllMocks();
    mockMinioClient.bucketExists.mockResolvedValue(false);
  });

  it('creates bucket on initialize when missing', async () => {
    const service = new MinioStorageService({
      endpoint: 'minio',
      port: 9000,
      accessKey: 'access',
      secretKey: 'secret',
      bucket: 'novacommerce',
      useSsl: false,
    });

    await service.initialize();

    expect(mockMinioClient.bucketExists).toHaveBeenCalledWith('novacommerce');
    expect(mockMinioClient.makeBucket).toHaveBeenCalledWith('novacommerce');
  });

  it('uploads, downloads, checks existence, and deletes objects', async () => {
    const service = new MinioStorageService({
      endpoint: 'minio',
      port: 9000,
      accessKey: 'access',
      secretKey: 'secret',
      bucket: 'novacommerce',
      useSsl: false,
    });

    await service.upload({
      key: 'products/p1/image.jpg',
      body: Buffer.from('image-bytes'),
      contentType: 'image/jpeg',
    });

    expect(await service.exists({ key: 'products/p1/image.jpg' })).toBe(true);

    const downloaded = await service.download({ key: 'products/p1/image.jpg' });
    expect(new TextDecoder().decode(downloaded)).toBe('image-bytes');

    await service.delete({ key: 'products/p1/image.jpg' });
    expect(await service.exists({ key: 'products/p1/image.jpg' })).toBe(false);
  });

  it('throws availability error when ping fails', async () => {
    mockMinioClient.listBuckets.mockRejectedValueOnce(new Error('connection refused'));

    const service = new MinioStorageService({
      endpoint: 'minio',
      port: 9000,
      accessKey: 'access',
      secretKey: 'secret',
      bucket: 'novacommerce',
      useSsl: false,
    });

    await expect(service.ping()).rejects.toBeInstanceOf(AvailabilityError);
  });
});
