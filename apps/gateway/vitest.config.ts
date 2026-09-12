import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@novacommerce/building-blocks': path.resolve(
        __dirname,
        '../../packages/building-blocks/src/index.ts',
      ),
      '@novacommerce/database': path.resolve(__dirname, '../../packages/database/src/index.ts'),
      '@novacommerce/infrastructure': path.resolve(
        __dirname,
        '../../packages/infrastructure/src/index.ts',
      ),
    },
  },
  test: {
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/*.integration.test.ts',
      '../../modules/identity/**/*.test.ts',
      '../../modules/user/**/*.test.ts',
      '../../modules/catalog/**/*.test.ts',
      '../../modules/inventory/**/*.test.ts',
      '../../modules/cart/**/*.test.ts',
      '../../modules/checkout/**/*.test.ts',
      '../../modules/order/**/*.test.ts',
      '../../modules/payment/**/*.test.ts',
      '../../modules/shipping/**/*.test.ts',
      '../../modules/promotion/**/*.test.ts',
    ],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30_000,
    globals: false,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
    }),
  ],
});
