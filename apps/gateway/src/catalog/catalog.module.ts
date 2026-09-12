import { Module } from '@nestjs/common';
import { CATALOG_TOKENS } from '../../../../modules/catalog/contracts/tokens';
import { ArchiveProductHandler } from '../../../../modules/catalog/application/handlers/archive-product.handler';
import { ChangeProductPriceHandler } from '../../../../modules/catalog/application/handlers/change-product-price.handler';
import { CreateCategoryHandler } from '../../../../modules/catalog/application/handlers/create-category.handler';
import { CreateProductHandler } from '../../../../modules/catalog/application/handlers/create-product.handler';
import { GetCategoryByIdHandler } from '../../../../modules/catalog/application/handlers/get-category-by-id.handler';
import { GetProductByIdHandler } from '../../../../modules/catalog/application/handlers/get-product-by-id.handler';
import { GetProductBySlugHandler } from '../../../../modules/catalog/application/handlers/get-product-by-slug.handler';
import { ListCategoriesHandler } from '../../../../modules/catalog/application/handlers/list-categories.handler';
import { ListProductsHandler } from '../../../../modules/catalog/application/handlers/list-products.handler';
import { PublishProductHandler } from '../../../../modules/catalog/application/handlers/publish-product.handler';
import { UpdateCategoryHandler } from '../../../../modules/catalog/application/handlers/update-category.handler';
import { UpdateProductHandler } from '../../../../modules/catalog/application/handlers/update-product.handler';
import { PrismaOutboxStore } from '../../../../modules/catalog/infrastructure/prisma/prisma-outbox-store';
import { PrismaCategoryRepository } from '../../../../modules/catalog/infrastructure/repositories/prisma-category-repository';
import { PrismaProductRepository } from '../../../../modules/catalog/infrastructure/repositories/prisma-product-repository';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CategoriesController } from './controllers/categories.controller';
import { ProductsController } from './controllers/products.controller';

@Module({
  controllers: [ProductsController, CategoriesController],
  providers: [
    {
      provide: CATALOG_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: CATALOG_TOKENS.PRODUCT_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaProductRepository(prisma, outboxStore),
      inject: [PrismaService, CATALOG_TOKENS.OUTBOX_STORE],
    },
    {
      provide: CATALOG_TOKENS.CATEGORY_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaCategoryRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateProductHandler,
      useFactory: (productRepository: PrismaProductRepository) => new CreateProductHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductByIdHandler,
      useFactory: (productRepository: PrismaProductRepository) => new GetProductByIdHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: GetProductBySlugHandler,
      useFactory: (productRepository: PrismaProductRepository) => new GetProductBySlugHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: ListProductsHandler,
      useFactory: (productRepository: PrismaProductRepository) => new ListProductsHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: UpdateProductHandler,
      useFactory: (productRepository: PrismaProductRepository) => new UpdateProductHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: ChangeProductPriceHandler,
      useFactory: (productRepository: PrismaProductRepository) => new ChangeProductPriceHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: PublishProductHandler,
      useFactory: (productRepository: PrismaProductRepository) => new PublishProductHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: ArchiveProductHandler,
      useFactory: (productRepository: PrismaProductRepository) => new ArchiveProductHandler(productRepository),
      inject: [CATALOG_TOKENS.PRODUCT_REPOSITORY],
    },
    {
      provide: CreateCategoryHandler,
      useFactory: (categoryRepository: PrismaCategoryRepository) => new CreateCategoryHandler(categoryRepository),
      inject: [CATALOG_TOKENS.CATEGORY_REPOSITORY],
    },
    {
      provide: GetCategoryByIdHandler,
      useFactory: (categoryRepository: PrismaCategoryRepository) => new GetCategoryByIdHandler(categoryRepository),
      inject: [CATALOG_TOKENS.CATEGORY_REPOSITORY],
    },
    {
      provide: ListCategoriesHandler,
      useFactory: (categoryRepository: PrismaCategoryRepository) => new ListCategoriesHandler(categoryRepository),
      inject: [CATALOG_TOKENS.CATEGORY_REPOSITORY],
    },
    {
      provide: UpdateCategoryHandler,
      useFactory: (categoryRepository: PrismaCategoryRepository) => new UpdateCategoryHandler(categoryRepository),
      inject: [CATALOG_TOKENS.CATEGORY_REPOSITORY],
    },
  ],
})
export class CatalogModule {}
