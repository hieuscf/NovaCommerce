import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import type { ICache } from '@novacommerce/building-blocks';
import { CART_TOKENS } from '../../../../modules/cart/contracts/tokens';
import { AddCartItemHandler } from '../../../../modules/cart/application/handlers/add-cart-item.handler';
import { ClearCartHandler } from '../../../../modules/cart/application/handlers/clear-cart.handler';
import { GetCartHandler } from '../../../../modules/cart/application/handlers/get-cart.handler';
import { RemoveCartItemHandler } from '../../../../modules/cart/application/handlers/remove-cart-item.handler';
import { UpdateCartItemQuantityHandler } from '../../../../modules/cart/application/handlers/update-cart-item-quantity.handler';
import { PrismaOutboxStore } from '../../../../modules/cart/infrastructure/prisma/prisma-outbox-store';
import { CachedCartRepository } from '../../../../modules/cart/infrastructure/repositories/cached-cart-repository';
import { PrismaCartRepository } from '../../../../modules/cart/infrastructure/repositories/prisma-cart-repository';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { CACHE_SERVICE } from '../infrastructure/redis/redis.module';
import { CartController } from './controllers/cart.controller';

@Module({
  imports: [UserModule],
  controllers: [CartController],
  providers: [
    {
      provide: CART_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: PrismaCartRepository,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaCartRepository(prisma, outboxStore),
      inject: [PrismaService, CART_TOKENS.OUTBOX_STORE],
    },
    {
      provide: CART_TOKENS.CART_REPOSITORY,
      useFactory: (repository: PrismaCartRepository, cache: ICache) =>
        new CachedCartRepository(repository, cache),
      inject: [PrismaCartRepository, CACHE_SERVICE],
    },
    {
      provide: GetCartHandler,
      useFactory: (userRepository, cartRepository) => new GetCartHandler(userRepository, cartRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CART_TOKENS.CART_REPOSITORY],
    },
    {
      provide: AddCartItemHandler,
      useFactory: (userRepository, cartRepository) => new AddCartItemHandler(userRepository, cartRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CART_TOKENS.CART_REPOSITORY],
    },
    {
      provide: UpdateCartItemQuantityHandler,
      useFactory: (userRepository, cartRepository) =>
        new UpdateCartItemQuantityHandler(userRepository, cartRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CART_TOKENS.CART_REPOSITORY],
    },
    {
      provide: RemoveCartItemHandler,
      useFactory: (userRepository, cartRepository) => new RemoveCartItemHandler(userRepository, cartRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CART_TOKENS.CART_REPOSITORY],
    },
    {
      provide: ClearCartHandler,
      useFactory: (userRepository, cartRepository) => new ClearCartHandler(userRepository, cartRepository),
      inject: [USER_TOKENS.USER_REPOSITORY, CART_TOKENS.CART_REPOSITORY],
    },
  ],
})
export class CartModule {}
