export interface ObjectReference {
  readonly key: string;
  readonly bucket?: string;
}

export interface UploadObjectInput {
  readonly key: string;
  readonly body: Uint8Array | string;
  readonly contentType?: string;
  readonly bucket?: string;
}

export interface DownloadObjectInput {
  readonly key: string;
  readonly bucket?: string;
}

export interface DeleteObjectInput {
  readonly key: string;
  readonly bucket?: string;
}

export interface StoredObject {
  readonly key: string;
  readonly bucket: string;
  readonly etag?: string;
  readonly size?: number;
}

export interface IObjectStorage {
  upload(input: UploadObjectInput): Promise<StoredObject>;
  download(input: DownloadObjectInput): Promise<Uint8Array>;
  delete(input: DeleteObjectInput): Promise<void>;
  exists(input: ObjectReference): Promise<boolean>;
  ping(): Promise<void>;
}

export const ObjectStoragePaths = {
  productImage(productId: string, objectId: string): string {
    return `products/${productId}/${objectId}`;
  },
  reviewImage(reviewId: string, objectId: string): string {
    return `reviews/${reviewId}/${objectId}`;
  },
  document(documentId: string, objectId: string): string {
    return `documents/${documentId}/${objectId}`;
  },
  invoice(invoiceId: string, objectId: string): string {
    return `invoices/${invoiceId}/${objectId}`;
  },
  exportFile(exportId: string, objectId: string): string {
    return `exports/${exportId}/${objectId}`;
  },
} as const;
