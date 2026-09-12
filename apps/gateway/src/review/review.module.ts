import { Module } from '@nestjs/common';
import type { IObjectStorage } from '@novacommerce/building-blocks';
import type { AppConfig } from '@novacommerce/infrastructure';
import type { IProductRepository } from '../../../../modules/catalog/domain/repositories/i-product-repository';
import { CATALOG_TOKENS } from '../../../../modules/catalog/contracts/tokens';
import type { IUserRepository } from '../../../../modules/user/domain/repositories/i-user-repository';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { REVIEW_TOKENS } from '../../../../modules/review/contracts/tokens';
import { AddReviewImageHandler } from '../../../../modules/review/application/handlers/add-review-image.handler';
import { CreateReviewHandler } from '../../../../modules/review/application/handlers/create-review.handler';
import { GetReviewByIdHandler } from '../../../../modules/review/application/handlers/get-review-by-id.handler';
import { ListReviewsByProductHandler } from '../../../../modules/review/application/handlers/list-reviews-by-product.handler';
import { PublishReviewHandler } from '../../../../modules/review/application/handlers/publish-review.handler';
import { UpdateReviewHandler } from '../../../../modules/review/application/handlers/update-review.handler';
import { PrismaOutboxStore } from '../../../../modules/review/infrastructure/prisma/prisma-outbox-store';
import { PrismaReviewRepository } from '../../../../modules/review/infrastructure/repositories/prisma-review-repository';
import { MinioReviewImageStorage } from '../../../../modules/review/infrastructure/services/minio-review-image-storage';
import { APP_CONFIG } from '../config/app-config.constants';
import { CatalogModule } from '../catalog/catalog.module';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { OBJECT_STORAGE } from '../infrastructure/minio/minio.module';
import { UserModule } from '../user/user.module';
import { ReviewsController } from './controllers/reviews.controller';

@Module({
  imports: [CatalogModule, UserModule],
  controllers: [ReviewsController],
  providers: [
    {
      provide: REVIEW_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: REVIEW_TOKENS.REVIEW_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaReviewRepository(prisma, outboxStore),
      inject: [PrismaService, REVIEW_TOKENS.OUTBOX_STORE],
    },
    {
      provide: REVIEW_TOKENS.REVIEW_IMAGE_STORAGE,
      useFactory: (objectStorage: IObjectStorage, config: AppConfig) => {
        const protocol = config.minio.useSsl ? 'https' : 'http';
        const publicBaseUrl = `${protocol}://${config.minio.endpoint}:${config.minio.port}`;
        return new MinioReviewImageStorage(objectStorage, publicBaseUrl);
      },
      inject: [OBJECT_STORAGE, APP_CONFIG],
    },
    {
      provide: CreateReviewHandler,
      useFactory: (
        userRepository: IUserRepository,
        productRepository: IProductRepository,
        reviewRepository: PrismaReviewRepository,
      ) => new CreateReviewHandler(userRepository, productRepository, reviewRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CATALOG_TOKENS.PRODUCT_REPOSITORY, REVIEW_TOKENS.REVIEW_REPOSITORY],
    },
    {
      provide: UpdateReviewHandler,
      useFactory: (userRepository: IUserRepository, reviewRepository: PrismaReviewRepository) =>
        new UpdateReviewHandler(userRepository, reviewRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, REVIEW_TOKENS.REVIEW_REPOSITORY],
    },
    {
      provide: PublishReviewHandler,
      useFactory: (reviewRepository: PrismaReviewRepository) => new PublishReviewHandler(reviewRepository),
      inject: [REVIEW_TOKENS.REVIEW_REPOSITORY],
    },
    {
      provide: GetReviewByIdHandler,
      useFactory: (reviewRepository: PrismaReviewRepository) => new GetReviewByIdHandler(reviewRepository),
      inject: [REVIEW_TOKENS.REVIEW_REPOSITORY],
    },
    {
      provide: ListReviewsByProductHandler,
      useFactory: (productRepository: IProductRepository, reviewRepository: PrismaReviewRepository) =>
        new ListReviewsByProductHandler(productRepository, reviewRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY, REVIEW_TOKENS.REVIEW_REPOSITORY],
    },
    {
      provide: AddReviewImageHandler,
      useFactory: (
        userRepository: IUserRepository,
        reviewRepository: PrismaReviewRepository,
        reviewImageStorage: MinioReviewImageStorage,
      ) => new AddReviewImageHandler(userRepository, reviewRepository, reviewImageStorage),
      inject: [USER_TOKENS.USER_REPOSITORY, REVIEW_TOKENS.REVIEW_REPOSITORY, REVIEW_TOKENS.REVIEW_IMAGE_STORAGE],
    },
  ],
  exports: [REVIEW_TOKENS.REVIEW_REPOSITORY],
})
export class ReviewModule {}
