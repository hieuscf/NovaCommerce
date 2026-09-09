import {
  InMemoryEventBus,
  OutboxPublisher,
} from '@novacommerce/building-blocks';
import { PrismaClient, PrismaOutboxRepository } from '@novacommerce/database';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const BATCH_SIZE = Number(process.env.WORKER_BATCH_SIZE ?? 10);

const prisma = new PrismaClient();
const eventBus = new InMemoryEventBus();
const outboxRepository = new PrismaOutboxRepository(prisma);
const outboxPublisher = new OutboxPublisher(outboxRepository, eventBus, {
  batchSize: BATCH_SIZE,
});

let running = true;

export { eventBus, outboxPublisher, outboxRepository, prisma };

async function shutdown(signal: string): Promise<void> {
  if (!running) {
    return;
  }

  running = false;
  console.info(`Worker received ${signal}, shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

async function run(): Promise<void> {
  console.info('Outbox worker started');

  while (running) {
    try {
      const processedCount = await outboxPublisher.processBatch();
      if (processedCount > 0) {
        console.info(`Outbox worker processed ${processedCount} message(s)`);
      }
    } catch (error) {
      console.error('Outbox worker batch failed', error);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

run().catch(async (error: unknown) => {
  console.error('Outbox worker failed', error);
  await prisma.$disconnect();
  process.exit(1);
});
