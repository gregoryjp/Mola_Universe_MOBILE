import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.test.ts',
      'tests/**/*.test.tsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'tests', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@core/': path.resolve(__dirname, './src/core/'),
      '@domain/': path.resolve(__dirname, './src/domain/'),
      '@data/': path.resolve(__dirname, './src/data/'),
      '@presentation/': path.resolve(__dirname, './src/presentation/'),
      '@shared/': path.resolve(__dirname, './src/shared/'),
      '@/': path.resolve(__dirname, './src/'),
    },
  },
});
