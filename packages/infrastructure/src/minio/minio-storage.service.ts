import {
  AvailabilityError,
  InfrastructureError,
  type DeleteObjectInput,
  type DownloadObjectInput,
  type IObjectStorage,
  type ObjectReference,
  type StoredObject,
  type UploadObjectInput,
} from '@novacommerce/building-blocks';
import { Client as MinioClient } from 'minio';

export interface MinioStorageServiceOptions {
  readonly endpoint: string;
  readonly port: number;
  readonly accessKey: string;
  readonly secretKey: string;
  readonly bucket: string;
  readonly useSsl: boolean;
}

export class MinioStorageService implements IObjectStorage {
  private readonly client: MinioClient;
  private readonly defaultBucket: string;
  private bucketInitialized = false;

  constructor(options: MinioStorageServiceOptions) {
    this.defaultBucket = options.bucket;
    this.client = new MinioClient({
      endPoint: options.endpoint,
      port: options.port,
      useSSL: options.useSsl,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });
  }

  async initialize(): Promise<void> {
    if (this.bucketInitialized) {
      return;
    }

    try {
      const exists = await this.client.bucketExists(this.defaultBucket);

      if (!exists) {
        await this.client.makeBucket(this.defaultBucket);
      }

      this.bucketInitialized = true;
    } catch (error) {
      throw new AvailabilityError('Failed to initialize MinIO bucket', error);
    }
  }

  async ping(): Promise<void> {
    try {
      await this.client.listBuckets();
    } catch (error) {
      throw new AvailabilityError('MinIO health check failed', error);
    }
  }

  async upload(input: UploadObjectInput): Promise<StoredObject> {
    const bucket = this.resolveBucket(input.bucket);

    try {
      const body = this.toBuffer(input.body);
      const result = await this.client.putObject(
        bucket,
        input.key,
        body,
        body.length,
        input.contentType ? { 'Content-Type': input.contentType } : undefined,
      );

      return {
        key: input.key,
        bucket,
        etag: result.etag,
        size: body.length,
      };
    } catch (error) {
      throw this.wrapOperationError('MinIO upload failed', error);
    }
  }

  async download(input: DownloadObjectInput): Promise<Uint8Array> {
    const bucket = this.resolveBucket(input.bucket);

    try {
      const stream = await this.client.getObject(bucket, input.key);
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        stream.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        stream.on('end', () => resolve());
        stream.on('error', (error: Error) => reject(error));
      });

      return new Uint8Array(Buffer.concat(chunks));
    } catch (error) {
      throw this.wrapOperationError('MinIO download failed', error);
    }
  }

  async delete(input: DeleteObjectInput): Promise<void> {
    const bucket = this.resolveBucket(input.bucket);

    try {
      await this.client.removeObject(bucket, input.key);
    } catch (error) {
      throw this.wrapOperationError('MinIO delete failed', error);
    }
  }

  async exists(input: ObjectReference): Promise<boolean> {
    const bucket = this.resolveBucket(input.bucket);

    try {
      await this.client.statObject(bucket, input.key);
      return true;
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return false;
      }

      throw this.wrapOperationError('MinIO exists check failed', error);
    }
  }

  private resolveBucket(bucket?: string): string {
    return bucket ?? this.defaultBucket;
  }

  private toBuffer(body: Buffer | Uint8Array | string): Buffer {
    if (typeof body === 'string') {
      return Buffer.from(body);
    }

    return Buffer.from(body);
  }

  private isNotFoundError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }

    return error.name === 'NotFound' || error.message.toLowerCase().includes('not found');
  }

  private wrapOperationError(message: string, error: unknown): InfrastructureError {
    if (error instanceof InfrastructureError) {
      return error;
    }

    return new InfrastructureError(message, 'OBJECT_STORAGE_ERROR', error);
  }
}
