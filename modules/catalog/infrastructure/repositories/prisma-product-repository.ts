import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient, ProductStatus as PrismaProductStatus } from '@prisma/client';
import { Product, ProductStatus } from '../../domain/aggregates/product';
import { ProductAttribute } from '../../domain/entities/product-attribute';
import { ProductImage } from '../../domain/entities/product-image';
import { ProductOption } from '../../domain/entities/product-option';
import { ProductVariant } from '../../domain/entities/product-variant';
import type {
  IProductRepository,
  ProductListParams,
  ProductListResult,
} from '../../domain/repositories/i-product-repository';
import { Money } from '../../domain/value-objects/money';
import { ProductName } from '../../domain/value-objects/product-name';
import { ProductSku } from '../../domain/value-objects/product-sku';
import { ProductSlug } from '../../domain/value-objects/product-slug';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type ProductRow = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    images: true;
    attributes: true;
    options: true;
  };
}>;

export class PrismaProductRepository implements IProductRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: ProductSlug): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { slug: slug.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async existsBySlug(slug: ProductSlug, excludeId?: string): Promise<boolean> {
    const row = await this.prisma.product.findUnique({
      where: { slug: slug.value },
      select: { id: true },
    });
    if (!row) {
      return false;
    }
    return excludeId ? row.id !== excludeId : true;
  }

  async list(params: ProductListParams = {}): Promise<ProductListResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const pageSize = params.pageSize && params.pageSize > 0 ? Math.min(params.pageSize, 100) : 20;
    const where: Prisma.ProductWhereInput = {};

    if (params.status) {
      where.status = params.status as PrismaProductStatus;
    }
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.defaultInclude(),
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: rows.map((row) => this.toDomain(row)),
      total,
    };
  }

  async save(product: Product): Promise<void> {
    const events = product.pullDomainEvents();
    const basePrice = product.getBasePrice();

    await this.prisma.$transaction(async (tx) => {
      await tx.product.upsert({
        where: { id: product.id },
        create: {
          id: product.id,
          name: product.getName().value,
          slug: product.getSlug().value,
          basePriceAmount: basePrice.amount,
          basePriceCurrency: basePrice.currency,
          status: product.getStatus() as PrismaProductStatus,
          categoryId: product.getCategoryId(),
        },
        update: {
          name: product.getName().value,
          slug: product.getSlug().value,
          basePriceAmount: basePrice.amount,
          basePriceCurrency: basePrice.currency,
          status: product.getStatus() as PrismaProductStatus,
          categoryId: product.getCategoryId(),
        },
      });

      await this.syncVariants(tx, product);
      await this.syncImages(tx, product);
      await this.syncAttributes(tx, product);
      await this.syncOptions(tx, product);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(product.id, event)));
      }
    });
  }

  private async syncVariants(tx: Prisma.TransactionClient, product: Product): Promise<void> {
    const existing = await tx.productVariant.findMany({ where: { productId: product.id } });
    const desiredIds = new Set(product.getVariants().map((variant) => variant.id));

    for (const variant of product.getVariants()) {
      const price = variant.getPrice();
      await tx.productVariant.upsert({
        where: { id: variant.id },
        create: {
          id: variant.id,
          productId: product.id,
          sku: variant.getSku().value,
          priceAmount: price.amount,
          priceCurrency: price.currency,
          attributes: variant.getAttributes(),
        },
        update: {
          sku: variant.getSku().value,
          priceAmount: price.amount,
          priceCurrency: price.currency,
          attributes: variant.getAttributes(),
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.productVariant.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncImages(tx: Prisma.TransactionClient, product: Product): Promise<void> {
    const existing = await tx.productImage.findMany({ where: { productId: product.id } });
    const desiredIds = new Set(product.getImages().map((image) => image.id));

    for (const image of product.getImages()) {
      await tx.productImage.upsert({
        where: { id: image.id },
        create: {
          id: image.id,
          productId: product.id,
          url: image.getUrl(),
          sortOrder: image.getSortOrder(),
        },
        update: {
          url: image.getUrl(),
          sortOrder: image.getSortOrder(),
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.productImage.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncAttributes(tx: Prisma.TransactionClient, product: Product): Promise<void> {
    const existing = await tx.productAttribute.findMany({ where: { productId: product.id } });
    const desiredIds = new Set(product.getAttributes().map((attribute) => attribute.id));

    for (const attribute of product.getAttributes()) {
      await tx.productAttribute.upsert({
        where: { id: attribute.id },
        create: {
          id: attribute.id,
          productId: product.id,
          name: attribute.getName(),
          value: attribute.getValue(),
        },
        update: {
          name: attribute.getName(),
          value: attribute.getValue(),
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.productAttribute.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncOptions(tx: Prisma.TransactionClient, product: Product): Promise<void> {
    const existing = await tx.productOption.findMany({ where: { productId: product.id } });
    const desiredIds = new Set(product.getOptions().map((option) => option.id));

    for (const option of product.getOptions()) {
      await tx.productOption.upsert({
        where: { id: option.id },
        create: {
          id: option.id,
          productId: product.id,
          name: option.getName(),
          values: option.getValues(),
        },
        update: {
          name: option.getName(),
          values: option.getValues(),
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.productOption.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return {
      variants: true,
      images: true,
      attributes: true,
      options: true,
    } as const;
  }

  private toDomain(row: ProductRow): Product {
    return Product.reconstitute({
      id: row.id,
      name: ProductName.create(row.name),
      slug: ProductSlug.create(row.slug),
      basePrice: Money.create(Number(row.basePriceAmount), row.basePriceCurrency),
      status: row.status as ProductStatus,
      categoryId: row.categoryId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      variants: row.variants.map((variant) =>
        ProductVariant.create(
          variant.id,
          ProductSku.create(variant.sku),
          Money.create(Number(variant.priceAmount), variant.priceCurrency),
          this.parseAttributes(variant.attributes),
        ),
      ),
      images: row.images.map((image) => ProductImage.create(image.id, image.url, image.sortOrder)),
      attributes: row.attributes.map((attribute) =>
        ProductAttribute.create(attribute.id, attribute.name, attribute.value),
      ),
      options: row.options.map((option) =>
        ProductOption.create(option.id, option.name, this.parseOptionValues(option.values)),
      ),
    });
  }

  private parseAttributes(value: Prisma.JsonValue): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return {};
    }

    const result: Record<string, string> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry === 'string') {
        result[key] = entry;
      }
    }
    return result;
  }

  private parseOptionValues(value: Prisma.JsonValue): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Product',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
