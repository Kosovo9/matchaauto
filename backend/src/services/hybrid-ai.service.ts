
import { Context } from 'hono';
import { HfInference } from '@huggingface/inference';

interface AIRequest {
    prompt: string;
    model?: 'qwen' | 'deepseek';
    context?: any;
}

export class HybridAIService {
    private static instance: HybridAIService;
    private readonly OLLAMA_URL = 'http://match-auto-ollama:11434/api/generate';
    private hf: HfInference;

    private readonly MODELS = {
        qwen: "Qwen/Qwen2.5-72B-Instruct",
        deepseek: "deepseek-ai/DeepSeek-Coder-V2-Instruct"
    };

    private constructor() {
        // El token se inyecta vía variables de entorno en el contenedor
        this.hf = new HfInference(process.env.HF_API_TOKEN || '');
    }

    public static getInstance(): HybridAIService {
        if (!HybridAIService.instance) {
            HybridAIService.instance = new HybridAIService();
        }
        return HybridAIService.instance;
    }

    public async processRequest(c: Context, data: AIRequest) {
        const isOnline = c.get('isOnline');

        if (isOnline && process.env.HF_API_TOKEN) {
            try {
                return await this.callHuggingFace(data);
            } catch (error) {
                console.warn('⚠️ HuggingFace failed, falling back to Local Ollama...', error);
                return await this.callLocalOllama(data);
            }
        } else {
            return await this.callLocalOllama(data);
        }
    }

    private async callHuggingFace(data: AIRequest) {
        const modelId = data.model === 'deepseek' ? this.MODELS.deepseek : this.MODELS.qwen;

        const startTime = Date.now();
        const response = await this.hf.textGeneration({
            model: modelId,
            inputs: data.prompt,
            parameters: {
                max_new_tokens: 500,
                temperature: 0.7,
                return_full_text: false
            }
        });
        const latency = `${Date.now() - startTime}ms`;

        return {
            source: `HF-CLOUD-${data.model?.toUpperCase() || 'QWEN'}`,
            latency,
            confidence: 0.98,
            response: response.generated_text
        };
    }

    private async callLocalOllama(data: AIRequest) {
        try {
            const startTime = Date.now();
            const response = await fetch(this.OLLAMA_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'qwen2.5:latest', // Asumimos que el usuario tiene qwen en Ollama
                    prompt: `[OFFLINE MODE] Analyze strictly: ${data.prompt}`,
                    stream: false
                })
            });

            if (!response.ok) throw new Error('Ollama connection failed');

            const result = await response.json();
            const latency = `${Date.now() - startTime}ms`;

            return {
                source: 'LOCAL-OLLAMA',
                latency,
                confidence: 0.90,
                response: result.response
            };
        } catch (e) {
            console.error('CRITICAL: Both Cloud and Local AI failed.', e);
            return {
                source: 'Failsafe-RuleEngine',
                response: 'AI unavailable. Using heuristic fallback.'
            };
        }
    }
}
