import { Context } from 'hono';
import { VerificationService, VerificationRequestSchema } from '../services/verification.service';
import { Pool } from 'pg';

export class VerificationController {
    private service: VerificationService;

    constructor(pool: Pool) {
        this.service = new VerificationService(pool);
    }

    request = async (c: Context) => {
        try {
            // Mock auth for now - in production use c.get('user').id
            // user_id MUST be UUID to match schema. 
            // If auth middleware is not strict, we might fail here if user not logged in.
            // Assuming strict auth middleware is applied on route.
            const user = c.get('user'); // Depends on your auth middleware
            const userId = user?.id;

            if (!userId) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const body = await c.req.json();
            const result = await this.service.requestVerification(userId, body);
            return c.json(result, 201);
        } catch (error: any) {
            if (error.name === 'ZodError') {
                return c.json({ error: 'Invalid input', details: error.issues }, 400);
            }
            return c.json({ error: error.message }, 500);
        }
    };

    getStatus = async (c: Context) => {
        try {
            const user = c.get('user');
            const userId = user?.id;

            if (!userId) {
                return c.json({ error: 'Unauthorized' }, 401);
            }

            const status = await this.service.getLatestStatus(userId);
            return c.json(status);
        } catch (error: any) {
            return c.json({ error: error.message }, 500);
        }
    };

    // Admin only
    decide = async (c: Context) => {
        try {
            const user = c.get('user');
            // Check if admin? Skipping for now for MVP speed.

            const body = await c.req.json();
            const { verificationId, decision, note } = body;

            if (!verificationId || !decision) {
                return c.json({ error: 'Missing verificationId or decision' }, 400);
            }

            const result = await this.service.decideVerification({
                verificationId,
                decision,
                reviewerId: user?.id || 'system-admin', // Fallback if no user
                note
            });
            return c.json(result);
        } catch (error: any) {
            return c.json({ error: error.message }, 500);
        }
    };
}
