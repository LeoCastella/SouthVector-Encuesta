/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts', 'server/**/*.test.ts'],
    coverage: {
      include: ['src/domain/**', 'netlify/functions/**', 'server/**'],
      thresholds: { lines: 90, branches: 90, functions: 90 },
    },
  },
})
