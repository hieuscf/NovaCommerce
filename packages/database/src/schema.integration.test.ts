import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PrismaClient } from '@prisma/client';
import { createTestPrismaClient, resetDatabase } from './test/database-test-utils';

describe('database schema constraints', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    prisma = createTestPrismaClient();
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('rejects duplicate identity email', async () => {
    const email = `user-${randomUUID()}@example.com`;

    await prisma.identity.create({
      data: {
        id: randomUUID(),
        email,
      },
    });

    await expect(
      prisma.identity.create({
        data: {
          id: randomUUID(),
          email,
        },
      }),
    ).rejects.toThrow();
  });

  it('enforces user profile foreign key', async () => {
    await expect(
      prisma.userProfile.create({
        data: {
          id: randomUUID(),
          userId: randomUUID(),
          displayName: 'Missing User',
        },
      }),
    ).rejects.toThrow();
  });

  it('cascades identity deletion to credentials', async () => {
    const identityId = randomUUID();

    await prisma.identity.create({
      data: {
        id: identityId,
        email: `cascade-${randomUUID()}@example.com`,
        credentials: {
          create: {
            id: randomUUID(),
            passwordHash: 'hash',
            algorithm: 'bcrypt',
          },
        },
      },
    });

    await prisma.identity.delete({ where: { id: identityId } });

    const credentials = await prisma.credential.findMany({
      where: { identityId },
    });

    expect(credentials).toHaveLength(0);
  });

  it('enforces unique product slug', async () => {
    const slug = `product-${randomUUID()}`;

    await prisma.product.create({
      data: {
        id: randomUUID(),
        name: 'Product A',
        slug,
        basePriceAmount: 10,
        basePriceCurrency: 'USD',
      },
    });

    await expect(
      prisma.product.create({
        data: {
          id: randomUUID(),
          name: 'Product B',
          slug,
          basePriceAmount: 20,
          basePriceCurrency: 'USD',
        },
      }),
    ).rejects.toThrow();
  });

  it('enforces unique inventory item per sku and warehouse', async () => {
    const sku = `SKU-${randomUUID()}`;
    const warehouseId = randomUUID();

    await prisma.inventoryItem.create({
      data: {
        id: randomUUID(),
        sku,
        warehouseId,
        onHand: 100,
      },
    });

    await expect(
      prisma.inventoryItem.create({
        data: {
          id: randomUUID(),
          sku,
          warehouseId,
          onHand: 50,
        },
      }),
    ).rejects.toThrow();
  });
});
