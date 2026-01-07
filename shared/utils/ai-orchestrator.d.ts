/**
 * 🤖 ORQUESTADOR DE IA SOBERANA (Open Source First)
 * Procesa Voz, Texto y Fraude para los 3 proyectos.
 */
export declare class AIOrchestrator {
    private static instance;
    private constructor();
    static getInstance(): AIOrchestrator;
    /**
     * PROCESAR CON IA (200% Resiliencia)
     * 1. Intenta con Hugging Face (Open Source - Whisper/Llama)
     * 2. Si falla, usa Backup (Google AI)
     */
    processSecurely(prompt: string, task: 'transcribe' | 'analyze' | 'translate'): Promise<string>;
    /**
     * Generación de Escudos Anti-Fraude (Feature #1)
     */
    detectFraud(listingData: any): Promise<boolean>;
}
