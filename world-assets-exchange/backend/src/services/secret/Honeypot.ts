import { Context } from 'hono';

export const honeypotTrap = async (c: Context) => {
    // Endpoints falsos como /wp-admin, /config.php, /.env
    // Si alguien los toca, Sentinel X los banea de por vida.
    const ip = c.req.header('x-forwarded-for') || 'unknown';

    console.log(`🚨 HONEYPOT TRIGGERED BY IP: ${ip}`);

    if (c.env?.VIRAL_DATA) {
        const banned = await c.env.VIRAL_DATA.get('banned_ips') || '[]';
        const list = JSON.parse(banned);
        list.push(ip);
        await c.env.VIRAL_DATA.put('banned_ips', JSON.stringify(list));
    }

    return c.json({ error: 'System error x000847', status: 500 }, 500);
};
