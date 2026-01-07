import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { FinTechSafeService } from '@shared/services/fintech-safe.service';

const escrow = new Hono();

/**
 * 🛒 GLOBAL MARKETPLACE ESCROW
 * Focused on general consumer goods and small-medium transactions.
 */

const EscrowInitSchema = z.object({
    buyerId: z.string().uuid(),
    sellerId: z.string().uuid(),
    itemId: z.string(),
    amount: z.number().positive(),
});

const HandshakeReleaseSchema = z.object({
    escrowId: z.string(),
    pin: z.string().length(6)
});

// 1. Iniciar un Escrow (Compra Segura)
escrow.post('/init', zValidator('json', EscrowInitSchema), async (c) => {
    const data = c.req.valid('json');

    // Sentinel X audit
    const security = await FinTechSafeService.verifyTransactionSecurity(data.buyerId, data.amount);

    if (!security.safe) {
        return c.json({ error: "SENTRY_LOCK", message: "Actividad sospechosa detectada." }, 403);
    }

    const escrowData = await FinTechSafeService.createEscrow(
        data.buyerId, data.sellerId, data.amount, data.itemId
    );

    return c.json({
        success: true,
        escrow: escrowData,
        message: "Fondos en custodia. El vendedor ha sido notificado para proceder con el envío/entrega."
    });
});

// 2. Liberar por PIN
escrow.post('/release', zValidator('json', HandshakeReleaseSchema), async (c) => {
    const { escrowId, pin } = c.req.valid('json');
    const mockVerificationPin = "654321"; // En prod viene de BD

    try {
        const result = await FinTechSafeService.releaseEscrowWithPin(escrowId, pin, mockVerificationPin);
        return c.json({
            success: true,
            status: 'COMPLETED',
            tx_hash: result.transaction_hash,
            message: "Transacción completada exitosamente."
        });
    } catch (error: any) {
        return c.json({ error: "AUTH_FAILED", message: "El PIN de entrega es incorrecto." }, 401);
    }
});

export default escrow;
