/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// envDir '..': the repo root .env (git-ignored) holds VITE_MAPBOX_TOKEN.
export default defineConfig({
  plugins: [react()],
  envDir: '..',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
