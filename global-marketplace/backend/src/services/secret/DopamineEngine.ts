export class DopamineEngine {
    private static WEIGHTS = {
        RECENCY: 0.4,
        URGENCY_SCARCITY: 0.3,
        PERSONALIZATION: 0.2,
        SOCIAL_PROOF: 0.1
    };

    static async getDopamineFeed(userId: string, context: any) {
        const candidates = await this.getCandidateListings();

        const scoredFeed = candidates.map(item => {
            const score =
                (item.isNew ? 1 : 0.5) * this.WEIGHTS.RECENCY +
                (item.viewersCount > 10 ? 1 : 0.2) * this.WEIGHTS.URGENCY_SCARCITY +
                (item.matchScore * this.WEIGHTS.PERSONALIZATION);

            return {
                ...item,
                finalScore: score,
                dopamineTriggers: this.generateTriggers(item)
            };
        }).sort((a, b) => b.finalScore - a.finalScore);

        return scoredFeed.slice(0, 20);
    }

    static async getIrresistibleNotification(userId: string, userPrefs: any = { optIn: true }) {
        if (!userPrefs.optIn) return null;
        const notifications = [
            {
                title: "🔥 ¡ALERTA DE OPORTUNIDAD!",
                body: "Un Tesla Model S acaba de bajar $2,000 en tu zona. 3 personas están en el checkout. ¡Muévete!",
                urgency: "CRITICAL",
                sound: "turbo_boost"
            },
            {
                title: "🎯 MATCH PERFECTO DETECTADO",
                body: "Nuestra AI encontró el auto exacto que buscabas. VIN verificado y precio 15% bajo mercado.",
                urgency: "HIGH",
                sound: "cash_register"
            },
            {
                title: "💰 DINERO ESPERÁNDOTE",
                body: "Tu anuncio tiene 45 nuevas visitas. El Ghost Negotiator bloqueó 3 ofertas bajas. Ajusta 2% para cerrar hoy.",
                urgency: "MEDIUM",
                sound: "ping"
            }
        ];

        return notifications[Math.floor(Math.random() * notifications.length)];
    }

    private static async getCandidateListings() {
        return Array.from({ length: 50 }).map((_, i) => ({
            id: `listing_${i}`,
            title: `Super Mach ${i}`,
            price: 15000 + i * 100,
            isNew: Math.random() > 0.5,
            viewersCount: Math.floor(Math.random() * 50),
            matchScore: Math.random(),
            images: ['https://cdn.match-auto.com/car.jpg']
        }));
    }

    private static generateTriggers(item: any) {
        const triggers = [];
        if (item.viewersCount > 20) triggers.push('📈 ALTA DEMANDA - 5 PERSONAS VIENDO');
        if (item.isNew) triggers.push('✨ RECIÉN LLEGADO - SÉ EL PRIMERO');
        if (item.matchScore > 0.8) triggers.push('🎯 MATCH 99% - DISEÑADO PARA TI');
        return triggers;
    }
}
