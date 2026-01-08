
import { logger } from '../../utils/logger';

export interface ModerationResult {
    safe: boolean;
    score: number;
    tags: string[];
    reason?: string;
}

export class ModerationService {
    /**
     * Modera una imagen (simulado P0).
     * En P1, esto llamaría a un modelo como NSFW-JS o una API de Clarifai/Google Vision.
     */
    static async moderateImage(imageUrl: string): Promise<ModerationResult> {
        logger.info(`[MODERATION] Scanning image: ${imageUrl}`);

        // Simulación de escaneo 1000x
        // En una implementación real, descargaríamos el buffer y lo pasaríamos por el modelo.

        const isMockMalicious = imageUrl.includes('malicious') || imageUrl.includes('fake');

        if (isMockMalicious) {
            return {
                safe: false,
                score: 0.99,
                tags: ['fraud', 'low_quality'],
                reason: 'Imagen detectada como potencialmente fraudulenta o de baja calidad.'
            };
        }

        return {
            safe: true,
            score: 0.01,
            tags: ['safe', 'high_res']
        };
    }

    /**
     * Modera texto (Listing Title/Description)
     */
    static async moderateText(text: string): Promise<ModerationResult> {
        const forbidden = ['arma', 'droga', 'estafa', 'sexo', 'nude'];
        const found = forbidden.filter(word => text.toLowerCase().includes(word));

        if (found.length > 0) {
            return {
                safe: false,
                score: 0.85,
                tags: found,
                reason: `Contenido prohibido detectado: ${found.join(', ')}`
            };
        }

        return {
            safe: true,
            score: 0.05,
            tags: []
        };
    }
}
