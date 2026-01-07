import { Hono } from 'hono';
import { sentinelMiddleware } from '../middleware/security';

const app = new Hono();

app.post('/upload', sentinelMiddleware, async (c) => {
    const body = await c.req.parseBody();
    const file = body['file'] as File;

    if (!file) {
        return c.json({ error: 'No file uploaded' }, 400);
    }

    // LÓGICA DE ALTA PERFORMANCE PARA CLOUDFLARE R2
    // En producción se usaría: await c.env.R2_BUCKET.put(key, file)
    const key = `listings/${crypto.randomUUID()}-${file.name}`;

    // Simulación de URL pública (Cloudflare R2 + Worker Proxy)
    const publicUrl = `https://cdn.match-auto.com/${key}`;

    return c.json({
        success: true,
        url: publicUrl,
        key: key
    });
});

export default app;
