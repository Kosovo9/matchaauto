import { compress } from 'hono/compress';

export const compression = () => {
    return compress({
        encoding: 'br', // Cloudflare supports Brotli natively, but Hono can suggest it
    });
};
