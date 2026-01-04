import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'miniflare',
        environmentOptions: {
            kvNamespaces: ['VIRAL_DATA', 'B2B_KEYS'],
        },
        setupFiles: ['./test/setup.ts'],
        include: ['**/*.{test,spec}.{ts,js}'],
        exclude: ['node_modules', 'dist'],
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        }
    }
});
