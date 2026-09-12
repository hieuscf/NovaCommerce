import { Module } from '@nestjs/common';
import { USER_TOKENS } from '../../../../modules/user/contracts/tokens';
import { AddAddressHandler } from '../../../../modules/user/application/handlers/add-address.handler';
import { CreateCustomerProfileHandler } from '../../../../modules/user/application/handlers/create-customer-profile.handler';
import { GetCustomerAccountHandler } from '../../../../modules/user/application/handlers/get-customer-account.handler';
import { GetCustomerAddressesHandler } from '../../../../modules/user/application/handlers/get-customer-addresses.handler';
import { GetCustomerPreferencesHandler } from '../../../../modules/user/application/handlers/get-customer-preferences.handler';
import { GetCustomerProfileHandler } from '../../../../modules/user/application/handlers/get-customer-profile.handler';
import { RemoveAddressHandler } from '../../../../modules/user/application/handlers/remove-address.handler';
import { SetDefaultAddressHandler } from '../../../../modules/user/application/handlers/set-default-address.handler';
import { UpdateAddressHandler } from '../../../../modules/user/application/handlers/update-address.handler';
import { UpdateCustomerPreferencesHandler } from '../../../../modules/user/application/handlers/update-customer-preferences.handler';
import { UpdateCustomerProfileHandler } from '../../../../modules/user/application/handlers/update-customer-profile.handler';
import { PrismaOutboxStore } from '../../../../modules/user/infrastructure/prisma/prisma-outbox-store';
import { PrismaUserRepository } from '../../../../modules/user/infrastructure/repositories/prisma-user-repository';
import { UsersController } from './controllers/users.controller';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [
    {
      provide: USER_TOKENS.OUTBOX_STORE,
      useFactory: (prisma: PrismaService) => new PrismaOutboxStore(prisma),
      inject: [PrismaService],
    },
    {
      provide: USER_TOKENS.USER_REPOSITORY,
      useFactory: (prisma: PrismaService, outboxStore: PrismaOutboxStore) =>
        new PrismaUserRepository(prisma, outboxStore),
      inject: [PrismaService, USER_TOKENS.OUTBOX_STORE],
    },
    {
      provide: CreateCustomerProfileHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new CreateCustomerProfileHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: GetCustomerProfileHandler,
      useFactory: (userRepository: PrismaUserRepository) => new GetCustomerProfileHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: GetCustomerAccountHandler,
      useFactory: (userRepository: PrismaUserRepository) => new GetCustomerAccountHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: UpdateCustomerProfileHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new UpdateCustomerProfileHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: GetCustomerAddressesHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new GetCustomerAddressesHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: AddAddressHandler,
      useFactory: (userRepository: PrismaUserRepository) => new AddAddressHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: UpdateAddressHandler,
      useFactory: (userRepository: PrismaUserRepository) => new UpdateAddressHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: RemoveAddressHandler,
      useFactory: (userRepository: PrismaUserRepository) => new RemoveAddressHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: SetDefaultAddressHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new SetDefaultAddressHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: GetCustomerPreferencesHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new GetCustomerPreferencesHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
    {
      provide: UpdateCustomerPreferencesHandler,
      useFactory: (userRepository: PrismaUserRepository) =>
        new UpdateCustomerPreferencesHandler(userRepository),
      inject: [USER_TOKENS.USER_REPOSITORY],
    },
  ],
  exports: [USER_TOKENS.USER_REPOSITORY],
})
export class UserModule {}
