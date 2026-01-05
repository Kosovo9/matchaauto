import { compress } from 'hono/compress';

export const compression = () => {
    return compress();
};
