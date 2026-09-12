import { BaseEntity } from '@novacommerce/building-blocks';
import { ReviewDomainError } from '../errors/review-domain.error';

const ALLOWED_MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export class ReviewMedia extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private url: string, private mediaType: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, url: string, mediaType: string): ReviewMedia {
    const normalizedUrl = url?.trim();
    const normalizedMediaType = mediaType?.trim().toLowerCase();

    if (!normalizedUrl) {
      throw new ReviewDomainError('Review media url is required', 'INVALID_REVIEW_MEDIA_URL');
    }
    if (!normalizedMediaType || !ALLOWED_MEDIA_TYPES.has(normalizedMediaType)) {
      throw new ReviewDomainError('Unsupported review media type', 'INVALID_REVIEW_MEDIA_TYPE');
    }

    return new ReviewMedia(id, new Date(), new Date(), normalizedUrl, normalizedMediaType);
  }

  static reconstitute(props: {
    id: string;
    url: string;
    mediaType: string;
    createdAt: Date;
    updatedAt: Date;
  }): ReviewMedia {
    return new ReviewMedia(props.id, props.createdAt, props.updatedAt, props.url, props.mediaType);
  }

  getUrl(): string { return this.url; }
  getMediaType(): string { return this.mediaType; }
}
