import { serve } from '@hono/node-server';
import app from './index.js';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

console.log(`🚀 Match-Auto Backend starting on port ${port}`);

serve({
    fetch: app.fetch,
    port: port
});
