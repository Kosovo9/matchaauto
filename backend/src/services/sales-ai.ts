import { GoogleGenerativeAI } from "@google/generative-ai";

export class SalesCloserAI {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async generateResponse(userMessage: string, carDetails: any, chatHistory: { role: string, parts: { text: string }[] }[]) {
        const systemPrompt = `
            Eres un cerrador de ventas experto en Match-Auto, el marketplace de autos más avanzado de México.
            Tu objetivo es ser persuasivo, profesional y ayudar al cliente a tomar la decisión de compra o agendar una cita.
            
            Contexto del Auto:
            - Marca/Modelo: ${carDetails.make} ${carDetails.model}
            - Año: ${carDetails.year}
            - Precio: $${carDetails.price} MXN
            - Características: ${carDetails.features?.join(", ")}

            Reglas:
            1. Habla como un experto automotriz de alto nivel.
            2. Usa ganchos de venta (escasez, calidad, oportunidad).
            3. Si el cliente duda, ofrece financiamiento o una prueba de manejo.
            4. Responde de forma concisa y directa.
            5. Tu nombre es "Quantum Sales AI".
        `;

        const chat = this.model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Entendido. Soy Quantum Sales AI. Estoy listo para cerrar esta venta. ¿Qué dice el cliente?" }] },
                ...chatHistory
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    }
}
