export class GhostNegotiator {
    private static LOWBALL_THRESHOLD = 0.7; // Rejects under 70% of price

    static shouldFilter(offer: number, askingPrice: number): {
        shouldReject: boolean;
        aiResponse?: string;
    } {
        if (offer < askingPrice * this.LOWBALL_THRESHOLD) {
            return {
                shouldReject: true,
                aiResponse: "Lo siento, el Ghost Negotiator de Match-Auto ha bloqueado esta oferta por ser inferior al valor de mercado. Por favor, realiza una oferta seria."
            };
        }
        return { shouldReject: false };
    }
}
