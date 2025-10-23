import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    setupFiles: ['./tests/setup.js'],
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results.json'
    }
  }
});
