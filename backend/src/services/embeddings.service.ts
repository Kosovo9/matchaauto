
export async function embedText(text: string): Promise<number[]> {
    try {
        // Usamos el nombre del servicio 'ollama' definido en docker-compose
        const res = await fetch("http://ollama:11434/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Ollama embeddings failed (${res.status}): ${errorText}`);
        }

        const json = await res.json();
        return json.embedding as number[];
    } catch (error) {
        console.error("[EMBEDDINGS] Error generating embedding:", error);
        // Fallback: vector de ceros si el servicio falla (para no romper el flujo)
        return new Array(768).fill(0);
    }
}
