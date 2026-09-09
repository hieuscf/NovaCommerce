import { BaseEntity } from '@novacommerce/building-blocks';

export class ReviewMedia extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private url: string, private mediaType: string) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, url: string, mediaType: string): ReviewMedia {
    return new ReviewMedia(id, new Date(), new Date(), url, mediaType);
  }

  getUrl(): string { return this.url; }
  getMediaType(): string { return this.mediaType; }
}
