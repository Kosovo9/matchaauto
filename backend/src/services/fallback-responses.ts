
export const getFallbackResponse = (question: string): string => {
    const q = question.toLowerCase();

    // Mecánica básica
    if (q.includes('llanta') || q.includes('neumático') || q.includes('pinchada')) {
        return "🚨 GUÍA DE EMERGENCIA (LLANTA): 1. Asegura el auto con freno de mano. 2. Afloja tuercas (sin quitarlas). 3. Coloca el gato en punto de apoyo y levanta. 4. Cambia la llanta. 5. Aprieta en cruz. ¡Busca llantera pronto!";
    }
    if (q.includes('batería') || q.includes('arranca') || q.includes('muerto')) {
        return "⚡ GUÍA DE EMERGENCIA (BATERÍA): Revisa si las terminales tienen sarro. Si tienes cables, conecta ROJO con ROJO y NEGRO a TIERRA (metal del motor) del auto muerto. Espera 5 min antes de intentar arrancar.";
    }

    // Salud / Emergencia
    if (q.includes('emergencia') || q.includes('médica') || q.includes('sangre') || q.includes('herido')) {
        return "🚑 ALERTA ROJA: 1. Llama al 911 si hay señal. 2. No muevas al herido salvo riesgo de explosión. 3. Aplica presión directa si hay sangrado. 4. Mantén la calma.";
    }

    // Default
    return "⚠️ SISTEMA OFFLINE LIMITADO: No tengo conexión a la Base de Conocimiento ni al Cerebro IA en este momento. Por favor, describe tu problema con una sola palabra clave (ej: 'llanta', 'batería') para acceder a guías de emergencia pre-cargadas.";
};
