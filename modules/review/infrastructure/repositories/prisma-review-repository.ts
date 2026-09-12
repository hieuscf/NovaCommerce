import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient, ReviewStatus as PrismaReviewStatus } from '@prisma/client';
import { Review, ReviewStatus } from '../../domain/aggregates/review';
import { ReviewMedia } from '../../domain/entities/review-media';
import type {
  IReviewRepository,
  ListReviewsByProductQuery,
} from '../../domain/repositories/i-review-repository';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Rating } from '../../domain/value-objects/rating';
import { ReviewText } from '../../domain/value-objects/review-text';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type ReviewRow = Prisma.ReviewGetPayload<{
  include: {
    media: true;
  };
}>;

export class PrismaReviewRepository implements IReviewRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Review | null> {
    const row = await this.prisma.review.findUnique({
      where: { id },
      include: { media: true },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByProduct(query: ListReviewsByProductQuery): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: {
        productId: query.productId,
        ...(query.status ? { status: this.toPrismaReviewStatus(query.status) } : {}),
      },
      include: { media: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async save(review: Review): Promise<void> {
    const events = review.pullDomainEvents();
    const productReference = review.getProductReference();

    await this.prisma.$transaction(async (tx) => {
      await tx.review.upsert({
        where: { id: review.id },
        create: {
          id: review.id,
          productId: productReference.productId,
          variantId: productReference.variantId ?? null,
          customerId: review.getCustomerId(),
          rating: review.getRating().value,
          text: review.getText().value,
          status: this.toPrismaReviewStatus(review.getStatus()),
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        },
        update: {
          productId: productReference.productId,
          variantId: productReference.variantId ?? null,
          customerId: review.getCustomerId(),
          rating: review.getRating().value,
          text: review.getText().value,
          status: this.toPrismaReviewStatus(review.getStatus()),
          updatedAt: review.updatedAt,
        },
      });

      await this.syncMedia(tx, review);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(review.id, event)));
      }
    });
  }

  private async syncMedia(tx: Prisma.TransactionClient, review: Review): Promise<void> {
    const existing = await tx.reviewMedia.findMany({ where: { reviewId: review.id } });
    const desiredIds = new Set(review.getMedia().map((media) => media.id));

    for (const media of review.getMedia()) {
      await tx.reviewMedia.upsert({
        where: { id: media.id },
        create: {
          id: media.id,
          reviewId: review.id,
          url: media.getUrl(),
          mediaType: media.getMediaType(),
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
        },
        update: {
          url: media.getUrl(),
          mediaType: media.getMediaType(),
          updatedAt: media.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.reviewMedia.delete({ where: { id: row.id } });
      }
    }
  }

  private toDomain(row: ReviewRow): Review {
    return Review.reconstitute({
      id: row.id,
      productReference: ProductReference.create(row.productId, row.variantId ?? undefined),
      customerId: row.customerId,
      rating: Rating.create(row.rating),
      text: ReviewText.create(row.text),
      status: this.toDomainReviewStatus(row.status),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      media: row.media.map((item) =>
        ReviewMedia.reconstitute({
          id: item.id,
          url: item.url,
          mediaType: item.mediaType,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      ),
    });
  }

  private toPrismaReviewStatus(status: ReviewStatus): PrismaReviewStatus {
    return status;
  }

  private toDomainReviewStatus(status: PrismaReviewStatus): ReviewStatus {
    return status === ReviewStatus.PUBLISHED ? ReviewStatus.PUBLISHED : ReviewStatus.DRAFT;
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Review',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
