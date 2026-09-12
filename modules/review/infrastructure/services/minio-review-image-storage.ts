import { ObjectStoragePaths, type IObjectStorage } from '@novacommerce/building-blocks';
import type {
  IReviewImageStorage,
  UploadReviewImageInput,
  UploadedReviewImage,
} from '../../application/contracts/i-review-image-storage';

export class MinioReviewImageStorage implements IReviewImageStorage {
  constructor(
    private readonly objectStorage: IObjectStorage,
    private readonly publicBaseUrl: string,
  ) {}

  async upload(input: UploadReviewImageInput): Promise<UploadedReviewImage> {
    const key = ObjectStoragePaths.reviewImage(input.reviewId, input.mediaId);
    const stored = await this.objectStorage.upload({
      key,
      body: input.content,
      contentType: input.contentType,
    });

    const normalizedBaseUrl = this.publicBaseUrl.replace(/\/$/, '');
    const url = `${normalizedBaseUrl}/${stored.bucket}/${stored.key}`;

    return {
      url,
      mediaType: input.contentType.trim().toLowerCase(),
    };
  }
}
