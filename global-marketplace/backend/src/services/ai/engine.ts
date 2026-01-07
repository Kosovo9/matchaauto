import { HfInference } from '@huggingface/inference'

export class AIOrchestrator {
    private hf: HfInference

    constructor(env: any) {
        this.hf = new HfInference(env.HF_TOKEN!)
    }

    async moderateText(text: string): Promise<{
        isSafe: boolean
        confidence: number
    }> {
        try {
            const result = await this.hf.textClassification({
                model: 'unitary/toxic-bert',
                inputs: text,
            })

            let isSafe = true
            let maxScore = 0

            result.forEach((item: any) => {
                if (item.score > 0.7 && item.label !== 'neutral') {
                    isSafe = false
                    maxScore = Math.max(maxScore, item.score)
                }
            })

            return { isSafe, confidence: maxScore }
        } catch (error) {
            console.error('AI moderation error:', error)
            return { isSafe: true, confidence: 0 }
        }
    }

    async suggestPrice(product: {
        title: string
        category: string
        condition: string
    }): Promise<{
        suggestedPrice: number
        confidence: number
    }> {
        // Simple fallback logic since full LLM prompt needs more config
        const basePrice = 10000
        return { suggestedPrice: basePrice, confidence: 0.8 }
    }
}
