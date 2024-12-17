import { defineConfig } from 'vite'

export default defineConfig({
  base: '/restapp/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    host: true
  }
}) 