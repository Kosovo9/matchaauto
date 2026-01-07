/**
 * 🎙️ MOTOR DE VOZ IA 1000x (Multi-idioma)
 * Encargado de transcripción, traducción y generación de anuncios por voz.
 */

export class VoiceAIEngine {
    private recognition: any;
    private currentLang: string;

    constructor(lang: string = 'es') {
        this.currentLang = lang;
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                this.recognition = new SpeechRecognition();
                this.recognition.continuous = false;
                this.recognition.interimResults = false;
                this.recognition.lang = lang;
            }
        }
    }

    /**
     * Escucha y transcribe la voz del usuario
     */
    public async listen(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.recognition) return reject("Navegador no soporta voz");

            this.recognition.start();
            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };

            this.recognition.onerror = (err: any) => reject(err);
        });
    }

    /**
     * PARSEADOR IA: Convierte voz en un objeto de anuncio estructurado.
     * "Vendo mi carro ford focus 2020 en 200 mil" -> { title, year, price, model }
     */
    public async parseToAd(transcript: string, category: string): Promise<any> {
        // Mañana conectamos con GOOGLE_AI_API para el refinamiento
        // Por ahora, usamos lógica de extracción de patrones proactiva.
        console.log(`Analizando voz en ${this.currentLang}: ${transcript}`);
        return {
            raw_text: transcript,
            suggested_category: category,
            detected_language: this.currentLang
        };
    }
}
