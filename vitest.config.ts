import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData'
            ]
        }
    },
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
});
