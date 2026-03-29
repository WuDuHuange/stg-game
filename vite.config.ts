import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, './src/core'),
      '@systems': path.resolve(__dirname, './src/systems'),
      '@game': path.resolve(__dirname, './src/game'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@data': path.resolve(__dirname, './src/data'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './assets'),
      '@config': path.resolve(__dirname, './config'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    base: './',
    rollupOptions: {
      output: {
        manualChunks: {
          'phaser': ['phaser'],
        },
      },
    },
  },
});
