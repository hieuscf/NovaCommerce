import { PrismaClient } from '@prisma/client';

const POLL_INTERVAL_MS = Number(process.env.WORKER_POLL_INTERVAL_MS ?? 5000);
const prisma = new PrismaClient();

let running = true;

async function processOutboxBatch(): Promise<void> {
  const pending = await prisma.outboxMessage.findMany({
    where: { processedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  for (const message of pending) {
    await prisma.outboxMessage.update({
      where: { id: message.id },
      data: { processedAt: new Date() },
    });
  }
}

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
      await processOutboxBatch();
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
