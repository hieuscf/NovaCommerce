import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Radix popper primitives (Select, DropdownMenu) carry a large fixed
    // per-test cost under jsdom. See src/test/popper.ts.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/components/**/*.tsx', 'src/lib/**/*.ts'],
      exclude: ['src/**/*.test.{ts,tsx}'],
    },
  },
});
