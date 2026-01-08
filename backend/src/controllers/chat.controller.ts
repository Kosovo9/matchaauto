
import { Hono } from 'hono';
import { logger } from '../utils/logger';

const chat = new Hono();

// Emulamos el "Sales AI Closer" que busca el QuantumChat.tsx
chat.post('/ai-close', async (c) => {
    try {
        const { message, carDetails, history } = await c.req.json();
        logger.info(`[CHAT] AI Assistant processing for: ${carDetails?.model}`);

        // Aquí iría el prompt a un LLM real (Ollama o GPT)
        // Por ahora, respuesta inteligente "hardcoded" de alto cierre.
        const replies = [
            "Excelente elección. El " + carDetails.model + " es de lo mejor en su segmento. ¿Te gustaría agendar una prueba de manejo para mañana?",
            "Ese precio es altamente competitivo para el estado actual del mercado. ¿Quieres que bloquee la unidad por 24 horas mientras lo piensas?",
            "Entiendo tu punto sobre el financiamiento. Tenemos planes que se ajustan justo a lo que buscas. ¿Te mando la tabla de amortización?"
        ];

        const reply = replies[Math.floor(Math.random() * replies.length)];

        return c.json({
            success: true,
            reply,
            suggestedAction: 'schedule_visit'
        });
    } catch (error: any) {
        return c.json({ success: false, error: error.message }, 500);
    }
});

export default chat;
