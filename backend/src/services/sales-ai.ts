export class SalesCloserAI {
    private apiKey: string;
    private model: string = "mistralai/Mistral-7B-Instruct-v0.2";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateResponse(userMessage: string, carDetails: any, chatHistory: { role: string, content: string }[]) {
        const systemPrompt = `
            Eres un cerrador de ventas experto en Match-Auto.
            Auto: ${carDetails.make} ${carDetails.model} (${carDetails.year}) - $${carDetails.price} MXN.
            Características: ${carDetails.features?.join(", ")}.
            
            Reglas:
            - Sé persuasivo y directo.
            - Usa ganchos de venta.
            - Tu nombre es "Quantum Sales AI".
            - No menciones que eres una IA.
        `;

        const messages = [
            { role: "system", content: systemPrompt },
            ...chatHistory.map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.content })),
            { role: "user", content: userMessage }
        ];

        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${this.model}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json"
                    },
                    method: "POST",
                    body: JSON.stringify({
                        inputs: this.formatPrompt(messages),
                        parameters: { max_new_tokens: 500, temperature: 0.7 }
                    }),
                }
            );

            const result = await response.json();
            // HF Inference API returns array for text-generation
            let text = "";
            if (Array.isArray(result) && result[0]?.generated_text) {
                text = result[0].generated_text;
            } else if (result.generated_text) {
                text = result.generated_text;
            } else {
                text = "Lo siento, tuve un problema cuántico. ¿En qué puedo ayudarte?";
            }

            // Limpiar la respuesta (Mistral a veces repite el prompt)
            if (text.includes("[/INST]")) {
                text = text.split("[/INST]").pop().trim();
            }

            return text;
        } catch (e) {
            console.error("HF Inference Error:", e);
            return "Error en la conexión con el servidor de inteligencia abierta.";
        }
    }

    private formatPrompt(messages: any[]) {
        return messages.map(m => {
            if (m.role === "system") return `[SYSTEM] ${m.content} [/SYSTEM]`;
            if (m.role === "user") return `[INST] ${m.content} [/INST]`;
            return m.content;
        }).join("\n");
    }
}
