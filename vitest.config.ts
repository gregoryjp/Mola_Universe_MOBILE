import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'tests', '**/*.config.*'],
    },
  },
  resolve: {
    alias: {
      // The real package reaches into a `react-native` subpath that a per-test
      // `vi.mock('react-native')` cannot intercept — see tests/helpers/safeAreaStub.ts.
      'react-native-safe-area-context': path.resolve(__dirname, './tests/helpers/safeAreaStub.ts'),
      // Same class of problem: `lucide-react-native` renders through
      // `react-native-svg`, which imports Flow-annotated `react-native` internals.
      // Aliased (not mocked per file) because the UI barrel re-exports the icons.
      'lucide-react-native': path.resolve(__dirname, './tests/helpers/lucideStub.ts'),
      '@core': path.resolve(__dirname, './src/core'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@data': path.resolve(__dirname, './src/data'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
