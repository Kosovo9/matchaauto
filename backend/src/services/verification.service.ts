import { Pool } from 'pg';
import { z } from 'zod';
import { logger } from '../utils/logger';

export const VerificationRequestSchema = z.object({
    docType: z.string().min(1), // Maps to id_type
    fileUrl: z.string().url(),  // Maps to video_url (using as general file/video url)
});

export type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

export class VerificationService {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async requestVerification(userId: string, input: VerificationRequest) {
        // Validate input
        const data = VerificationRequestSchema.parse(input);

        // Check for existing pending request to avoid duplicates? 
        // For now, allow multiple, or maybe logic to reject if one is pending.
        // Let's keep it simple as requested: INSERT.

        const query = `
            INSERT INTO identity_verifications (user_id, id_type, video_url, status, created_at)
            VALUES ($1, $2, $3, 'pending', NOW())
            RETURNING id, status, created_at
        `;

        try {
            const { rows } = await this.pool.query(query, [userId, data.docType, data.fileUrl]);
            logger.info(`[Verification] User ${userId} requested verification ${rows[0].id}`);
            return rows[0];
        } catch (error) {
            logger.error(`[Verification] Error requesting verification for user ${userId}`, error);
            throw error;
        }
    }

    async getLatestStatus(userId: string) {
        const query = `
            SELECT id, status, created_at, reviewed_at, review_note
            FROM identity_verifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 1
        `;

        try {
            const { rows } = await this.pool.query(query, [userId]);
            return rows[0] ?? { status: 'none' };
        } catch (error) {
            logger.error(`[Verification] Error fetching status for user ${userId}`, error);
            throw error;
        }
    }

    async decideVerification(params: {
        verificationId: string;
        decision: 'approved' | 'rejected';
        reviewerId: string;
        note?: string;
    }) {
        const query = `
            UPDATE identity_verifications
            SET status = $2, reviewed_by = $3, reviewed_at = NOW(), review_note = COALESCE($4, review_note), updated_at = NOW()
            WHERE id = $1
            RETURNING id, status, reviewed_at
        `;

        try {
            const { rows } = await this.pool.query(query, [
                params.verificationId,
                params.decision,
                params.reviewerId,
                params.note ?? null
            ]);

            if (rows.length === 0) {
                throw new Error('Verification request not found');
            }

            logger.info(`[Verification] Request ${params.verificationId} ${params.decision} by ${params.reviewerId}`);

            // If approved, we might want to update the users table 'identity_verified' column as well!
            if (params.decision === 'approved') {
                await this.updateUserVerifiedStatus(params.verificationId);
            }

            return rows[0];
        } catch (error) {
            logger.error(`[Verification] Error deciding verification ${params.verificationId}`, error);
            throw error;
        }
    }

    private async updateUserVerifiedStatus(verificationId: string) {
        // Get user_id from verification
        const vRes = await this.pool.query('SELECT user_id FROM identity_verifications WHERE id = $1', [verificationId]);
        if (!vRes.rows[0]) return;

        const userId = vRes.rows[0].user_id;

        // Update user table
        await this.pool.query('UPDATE users SET identity_verified = true, trust_badge = $1 WHERE id = $2', ['VERIFIED', userId]);
    }
}
