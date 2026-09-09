import { BaseEntity } from '@novacommerce/building-blocks';

export class ProductImage extends BaseEntity<string> {
  private constructor(id: string, createdAt: Date, updatedAt: Date, private url: string, private sortOrder: number) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, url: string, sortOrder: number): ProductImage {
    return new ProductImage(id, new Date(), new Date(), url, sortOrder);
  }

  getUrl(): string { return this.url; }
  getSortOrder(): number { return this.sortOrder; }
}
