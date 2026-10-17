import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4322' },
  webServer: { command: 'npx vite preview --port 4322 --strictPort', url: 'http://localhost:4322', reuseExistingServer: true },
})
