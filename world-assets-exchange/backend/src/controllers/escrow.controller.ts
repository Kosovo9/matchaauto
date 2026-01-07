import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { FinTechSafeService } from '@shared/services/fintech-safe.service';
import { DeliveryIntelService } from '@shared/services/delivery-intel.service';

const escrow = new Hono();

/**
 * 🏛️ WORLD ASSETS ESCROW & EXCHANGE (Permuta Hub)
 * Designed for High-Value Real Estate and Asset Swapping.
 */

const EscrowInitSchema = z.object({
    buyerId: z.string().uuid(),
    sellerId: z.string().uuid(),
    assetId: z.string(),
    amount: z.number().positive(),
    currency: z.string().default('USD')
});

const HandshakeReleaseSchema = z.object({
    escrowId: z.string(),
    pin: z.string().length(6)
});

const ExchangeSchema = z.object({
    partyA: z.object({ userId: z.string().uuid(), assetId: z.string() }),
    partyB: z.object({ userId: z.string().uuid(), assetId: z.string() }),
    cashDifference: z.number().default(0)
});

// 1. Iniciar un Escrow para compra de propiedad
escrow.post('/init', zValidator('json', EscrowInitSchema), async (c) => {
    const data = c.req.valid('json');

    // Verificación de seguridad previa con Sentinel X
    const security = await FinTechSafeService.verifyTransactionSecurity(data.buyerId, data.amount);

    if (!security.safe) {
        return c.json({ error: "SENTRY_LOCK", message: "Transacción bloqueada por riesgo de fraude." }, 403);
    }

    const escrowData = await FinTechSafeService.createEscrow(
        data.buyerId, data.sellerId, data.amount, data.assetId
    );

    return c.json({
        success: true,
        escrow: escrowData,
        message: "Fondos bloqueados en el contrato inteligente de Match-Auto."
    });
});

// 2. Liberación por PIN (Handshake de entrega/firma)
escrow.post('/release', zValidator('json', HandshakeReleaseSchema), async (c) => {
    const { escrowId, pin } = c.req.valid('json');

    // En producción, el verificationPin vendría de la BD asociado al escrowId
    const mockVerificationPin = "123456";

    try {
        const result = await FinTechSafeService.releaseEscrowWithPin(escrowId, pin, mockVerificationPin);
        return c.json({
            success: true,
            status: 'FUNDS_RELEASED',
            tx_hash: result.transaction_hash,
            message: "¡Felicidades! Los fondos han sido liberados al vendedor."
        });
    } catch (error: any) {
        return c.json({ error: "AUTH_FAILED", message: error.message }, 401);
    }
});

// 3. Orquestar Permuta (Intercambio de Activos)
escrow.post('/exchange/initiate', zValidator('json', ExchangeSchema), async (c) => {
    const data = c.req.valid('json');

    const exchange = await FinTechSafeService.initiateAssetExchange(
        { id: data.partyA.userId, assetId: data.partyA.assetId },
        { id: data.partyB.userId, assetId: data.partyB.assetId },
        data.cashDifference
    );

    return c.json({
        success: true,
        exchange,
        instructions: "Ambos usuarios deben confirmar el bloqueo de sus activos para proceder con la permuta legal."
    });
});

export default escrow;
