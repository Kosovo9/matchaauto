import { Hono } from 'hono';
import { requireLocalWindowsDev } from '../middleware/requireLocalWindowsDev';
import { EmailService } from '../services/email.service';

export const devRoutes = new Hono();

// Apply the surgical local-only protection to all dev routes
devRoutes.use('*', requireLocalWindowsDev());

devRoutes.get('/test-email', async (c) => {
    const email = new EmailService();
    try {
        await email.send({
            to: 'test@local.test',
            subject: 'War Room Ignition ✅',
            text: 'Mailpit OK. Dev-only route OK. Ready to ship.',
        });
        return c.json({ ok: true, sent: true });
    } catch (err) {
        console.error('Email test failed:', err);
        return c.json({ ok: false, error: 'Failed to send email' }, 500);
    }
});
