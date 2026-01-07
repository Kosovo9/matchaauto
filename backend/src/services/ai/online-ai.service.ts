
import { HfInference } from '@huggingface/inference';
import { Redis } from 'ioredis';
import { logger } from '../../utils/logger';

interface AIResponse {
    answer: string;
    model: string;
    source: 'online' | 'offline' | 'cache';
    latencyMs: number;
}

export class OnlineAIService {
    private hf: HfInference;
    private models = [
        'Qwen/Qwen2.5-72B-Instruct',
        'deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct', // Simulando deepseek2
        'moonshot-ai/moonshot-v1-8k' // Kimi fallback (u otro open source similar en HF)
    ];

    constructor(private redis: Redis, env: any) {
        this.hf = new HfInference(env.HF_API_TOKEN);
    }

    async generate(prompt: string, modelPreference: string = 'qwen3'): Promise<AIResponse> {
        const start = Date.now();

        // Mapeo de preferencias a modelos reales de HF
        const modelMap: Record<string, string> = {
            'qwen3': this.models[0],
            'deepseek2': this.models[1],
            'kimi2': this.models[2]
        };

        const targetModel = modelMap[modelPreference] || this.models[0];

        try {
            logger.info(`☁️ Online AI Query [${targetModel}]`);

            const result = await this.hf.textGeneration({
                model: targetModel,
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false
                }
            });

            return {
                answer: result.generated_text,
                model: targetModel,
                source: 'online',
                latencyMs: Date.now() - start
            };

        } catch (error) {
            logger.error(`Online AI Error (${targetModel}):`, error);
            throw error; // El orquestador manejará el fallback
        }
    }
}
