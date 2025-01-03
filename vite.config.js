import { defineConfig } from 'vite'

export default defineConfig({
  base: '/restapp/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  envDir: './',
  server: {
    port: 3000,
    host: true,
    https: true
  },
  preview: {
    port: 3000,
    host: true
  }
}) 