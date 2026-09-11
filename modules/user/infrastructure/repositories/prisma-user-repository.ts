import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';
import { User } from '../../domain/aggregates/user';
import { UserAddress } from '../../domain/entities/user-address';
import { UserPreference } from '../../domain/entities/user-preference';
import { UserProfile } from '../../domain/entities/user-profile';
import type { IUserRepository } from '../../domain/repositories/i-user-repository';
import { Address } from '../../domain/value-objects/address';
import { DisplayName } from '../../domain/value-objects/display-name';
import { PhoneNumber } from '../../domain/value-objects/phone-number';
import { PreferenceKey } from '../../domain/value-objects/preference-key';
import { UserId } from '../../domain/value-objects/user-id';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

export class PrismaUserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id: id.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByIdentityId(identityId: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { identityId },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    const events = user.pullDomainEvents();
    const profile = user.getProfile();

    await this.prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          identityId: user.getIdentityId(),
          profile: {
            create: {
              id: profile.id,
              displayName: profile.getDisplayName().value,
              phoneNumber: profile.getPhoneNumber()?.value,
              avatarUrl: profile.getAvatarUrl(),
            },
          },
        },
        update: {
          identityId: user.getIdentityId(),
        },
      });

      await tx.userProfile.upsert({
        where: { userId: user.id },
        create: {
          id: profile.id,
          userId: user.id,
          displayName: profile.getDisplayName().value,
          phoneNumber: profile.getPhoneNumber()?.value,
          avatarUrl: profile.getAvatarUrl(),
        },
        update: {
          displayName: profile.getDisplayName().value,
          phoneNumber: profile.getPhoneNumber()?.value,
          avatarUrl: profile.getAvatarUrl(),
        },
      });

      const existingAddresses = await tx.userAddress.findMany({ where: { userId: user.id } });
      const desiredAddressIds = new Set(user.getAddresses().map((address) => address.id));

      for (const address of user.getAddresses()) {
        const value = address.getAddress();
        await tx.userAddress.upsert({
          where: { id: address.id },
          create: {
            id: address.id,
            userId: user.id,
            label: address.getLabel(),
            line1: value.line1,
            line2: value.line2,
            city: value.city,
            state: value.state,
            postalCode: value.postalCode,
            country: value.country,
            isDefault: address.isDefaultAddress(),
          },
          update: {
            label: address.getLabel(),
            line1: value.line1,
            line2: value.line2,
            city: value.city,
            state: value.state,
            postalCode: value.postalCode,
            country: value.country,
            isDefault: address.isDefaultAddress(),
          },
        });
      }

      for (const existing of existingAddresses) {
        if (!desiredAddressIds.has(existing.id)) {
          await tx.userAddress.delete({ where: { id: existing.id } });
        }
      }

      const existingPreferences = await tx.userPreference.findMany({ where: { userId: user.id } });
      const desiredPreferenceKeys = new Set(user.getPreferences().map((item) => item.getKey().value));

      for (const preference of user.getPreferences()) {
        await tx.userPreference.upsert({
          where: {
            userId_key: {
              userId: user.id,
              key: preference.getKey().value,
            },
          },
          create: {
            id: preference.id,
            userId: user.id,
            key: preference.getKey().value,
            value: preference.getValue(),
          },
          update: {
            value: preference.getValue(),
          },
        });
      }

      for (const existing of existingPreferences) {
        if (!desiredPreferenceKeys.has(existing.key)) {
          await tx.userPreference.delete({ where: { id: existing.id } });
        }
      }

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(user.id, event)));
      }
    });
  }

  private defaultInclude() {
    return {
      profile: true,
      addresses: true,
      preferences: true,
    } as const;
  }

  private toDomain(row: {
    id: string;
    identityId: string;
    createdAt: Date;
    updatedAt: Date;
    profile: {
      id: string;
      displayName: string;
      phoneNumber: string | null;
      avatarUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    addresses: Array<{
      id: string;
      label: string;
      line1: string;
      line2: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      isDefault: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>;
    preferences: Array<{
      id: string;
      key: string;
      value: string;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }): User {
    if (!row.profile) {
      throw new Error(`User ${row.id} is missing profile`);
    }

    return User.reconstitute({
      id: row.id,
      identityId: row.identityId,
      profile: UserProfile.reconstitute({
        id: row.profile.id,
        displayName: DisplayName.create(row.profile.displayName),
        phoneNumber: row.profile.phoneNumber ? PhoneNumber.create(row.profile.phoneNumber) : undefined,
        avatarUrl: row.profile.avatarUrl ?? undefined,
        createdAt: row.profile.createdAt,
        updatedAt: row.profile.updatedAt,
      }),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      addresses: row.addresses.map((address) =>
        UserAddress.reconstitute({
          id: address.id,
          label: address.label,
          address: Address.create({
            line1: address.line1,
            line2: address.line2 ?? undefined,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          }),
          isDefault: address.isDefault,
          createdAt: address.createdAt,
          updatedAt: address.updatedAt,
        }),
      ),
      preferences: row.preferences.map((preference) =>
        UserPreference.reconstitute({
          id: preference.id,
          key: PreferenceKey.create(preference.key),
          value: preference.value,
          createdAt: preference.createdAt,
          updatedAt: preference.updatedAt,
        }),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'User',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
