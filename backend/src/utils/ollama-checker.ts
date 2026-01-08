
import { logger } from '../utils/logger';

export const isModelAvailable = async (modelName: string): Promise<boolean> => {
    try {
        // Timeout corto para no bloquear
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const res = await fetch('http://localhost:11434/api/tags', {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) return false;
        const data = await res.json() as any;

        // Verifica si algún modelo instalado coincide parcialmente con el nombre
        const available = data.models?.some((m: any) => m.name.includes(modelName));

        if (available) {
            logger.info(`✅ Local Model found: ${modelName}`);
        } else {
            logger.warn(`⚠️ Local Model NOT found: ${modelName}`);
        }

        return available;
    } catch (error) {
        logger.warn(`❌ Ollama check failed: ${error}`);
        return false;
    }
};
