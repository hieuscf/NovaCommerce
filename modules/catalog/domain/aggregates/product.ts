import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { CatalogDomainError } from '../errors/catalog-domain.error';
import { ProductAttribute } from '../entities/product-attribute';
import { ProductImage } from '../entities/product-image';
import { ProductOption } from '../entities/product-option';
import { ProductVariant } from '../entities/product-variant';
import type { ProductEventPayload } from '../events/product-event.payload';
import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductPriceChangedEvent } from '../events/product-price-changed.event';
import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import type { Money } from '../value-objects/money';
import type { ProductName } from '../value-objects/product-name';
import type { ProductSlug } from '../value-objects/product-slug';

export enum ProductStatus { DRAFT = 'draft', PUBLISHED = 'published', ARCHIVED = 'archived' }

export class Product extends AggregateRoot<string> {
  private variants: ProductVariant[] = [];
  private images: ProductImage[] = [];
  private attributes: ProductAttribute[] = [];
  private options: ProductOption[] = [];

  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private name: ProductName,
    private slug: ProductSlug,
    private basePrice: Money,
    private status: ProductStatus,
    private categoryId?: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, name: ProductName, slug: ProductSlug, basePrice: Money, categoryId?: string): Result<Product, CatalogDomainError> {
    const now = new Date();
    const product = new Product(id, now, now, name, slug, basePrice, ProductStatus.DRAFT, categoryId);
    product.addDomainEvent(new ProductCreatedEvent(id, now, product.toEventPayload()));
    return Result.ok(product);
  }

  static reconstitute(props: {
    id: string; name: ProductName; slug: ProductSlug; basePrice: Money; status: ProductStatus;
    categoryId?: string; createdAt: Date; updatedAt: Date;
    variants: ProductVariant[]; images: ProductImage[]; attributes: ProductAttribute[]; options: ProductOption[];
  }): Product {
    const product = new Product(props.id, props.createdAt, props.updatedAt, props.name, props.slug, props.basePrice, props.status, props.categoryId);
    product.variants = [...props.variants];
    product.images = [...props.images];
    product.attributes = [...props.attributes];
    product.options = [...props.options];
    return product;
  }

  changePrice(newPrice: Money): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Cannot change price of archived product', 'PRODUCT_ARCHIVED'));
    }
    const previous = this.basePrice;
    this.basePrice = newPrice;
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductPriceChangedEvent(this.id, new Date(), { amount: newPrice.amount, currency: newPrice.currency }));
    if (previous.amount !== newPrice.amount || previous.currency !== newPrice.currency) {
      this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    }
    return Result.ok(undefined);
  }

  updateDetails(props: {
    name?: ProductName;
    slug?: ProductSlug;
    categoryId?: string | null;
  }): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Cannot update archived product', 'PRODUCT_ARCHIVED'));
    }

    let changed = false;

    if (props.name && props.name.value !== this.name.value) {
      this.name = props.name;
      changed = true;
    }

    if (props.slug && props.slug.value !== this.slug.value) {
      this.slug = props.slug;
      changed = true;
    }

    if (props.categoryId !== undefined && props.categoryId !== this.categoryId) {
      this.categoryId = props.categoryId ?? undefined;
      changed = true;
    }

    if (!changed) {
      return Result.ok(undefined);
    }

    this.updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  publish(): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.PUBLISHED) {
      return Result.fail(new CatalogDomainError('Product is already published', 'PRODUCT_ALREADY_PUBLISHED'));
    }
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Cannot publish archived product', 'PRODUCT_ARCHIVED'));
    }
    this.status = ProductStatus.PUBLISHED;
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductPublishedEvent(this.id, new Date(), {}));
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  unpublish(): Result<void, CatalogDomainError> {
    if (this.status !== ProductStatus.PUBLISHED) {
      return Result.fail(new CatalogDomainError('Product is not published', 'PRODUCT_NOT_PUBLISHED'));
    }
    this.status = ProductStatus.DRAFT;
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  archive(): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Product is already archived', 'PRODUCT_ALREADY_ARCHIVED'));
    }
    this.status = ProductStatus.ARCHIVED;
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  addVariant(variant: ProductVariant): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Cannot add variant to archived product', 'PRODUCT_ARCHIVED'));
    }
    const duplicateSku = this.variants.some((item) => item.getSku().value === variant.getSku().value);
    if (duplicateSku) {
      return Result.fail(new CatalogDomainError('Variant SKU already exists on product', 'DUPLICATE_VARIANT_SKU'));
    }
    this.variants.push(variant);
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  addImage(image: ProductImage): Result<void, CatalogDomainError> {
    if (this.status === ProductStatus.ARCHIVED) {
      return Result.fail(new CatalogDomainError('Cannot add image to archived product', 'PRODUCT_ARCHIVED'));
    }
    this.images.push(image);
    this.updatedAt = new Date();
    this.addDomainEvent(new ProductUpdatedEvent(this.id, new Date(), this.toEventPayload()));
    return Result.ok(undefined);
  }

  getName(): ProductName { return this.name; }
  getSlug(): ProductSlug { return this.slug; }
  getBasePrice(): Money { return this.basePrice; }
  getStatus(): ProductStatus { return this.status; }
  getCategoryId(): string | undefined { return this.categoryId; }
  getVariants(): readonly ProductVariant[] { return this.variants; }
  getImages(): readonly ProductImage[] { return this.images; }
  getAttributes(): readonly ProductAttribute[] { return this.attributes; }
  getOptions(): readonly ProductOption[] { return this.options; }

  private toEventPayload(): ProductEventPayload {
    return {
      name: this.name.value,
      slug: this.slug.value,
      status: this.status,
      price: this.basePrice.amount,
      currency: this.basePrice.currency,
      ...(this.categoryId ? { categoryId: this.categoryId } : {}),
      images: [...this.images]
        .sort((left, right) => left.getSortOrder() - right.getSortOrder())
        .map((image) => image.getUrl()),
      attributes: this.attributes.map((attribute) => ({
        name: attribute.getName(),
        value: attribute.getValue(),
      })),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
