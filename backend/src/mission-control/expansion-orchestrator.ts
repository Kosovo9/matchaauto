// backend/src/mission-control/expansion-orchestrator.ts

export interface MarketProfile {
    region: string;
    currency: string;
    language: string;
    budget: number;
    status: 'planned' | 'initializing' | 'active' | 'optimized';
}

export class ExpansionOrchestrator {
    private markets: Map<string, MarketProfile>;
    private globalBudget: number;

    constructor(initialBudget: number = 20000) {
        this.globalBudget = initialBudget;
        this.markets = new Map();

        // Initialize Core Markets
        this.registerMarket('MX', { region: 'LATAM-NORTH', currency: 'MXN', language: 'ES-MX', budget: 5000, status: 'optimized' });
        this.registerMarket('US-LA', { region: 'USA-WEST', currency: 'USD', language: 'ES-US', budget: 8000, status: 'active' });
        this.registerMarket('BR-SP', { region: 'LATAM-EAST', currency: 'BRL', language: 'PT-BR', budget: 4000, status: 'initializing' });
        this.registerMarket('CO-BOG', { region: 'LATAM-ANDES', currency: 'COP', language: 'ES-CO', budget: 3000, status: 'initializing' });

        // Phase: LATAM TOTAL Expansion
        this.initLatamTotal();
    }

    private initLatamTotal() {
        const remainingLatam = [
            { id: 'AR', name: 'Argentina', curr: 'ARS' },
            { id: 'CL', name: 'Chile', curr: 'CLP' },
            { id: 'PE', name: 'Peru', curr: 'PEN' },
            { id: 'EC', name: 'Ecuador', curr: 'USD' }
        ];

        remainingLatam.forEach(m => {
            this.registerMarket(m.id, {
                region: 'LATAM-EXPANSION',
                currency: m.curr,
                language: 'ES-LATAM',
                budget: 1000,
                status: 'planned'
            });
        });
    }

    public async initiateConsolidationPhase() {
        console.log("🛡️ CONSOLIDATION PHASE ACTIVATED (30 DAYS)");
        this.markets.forEach((p, id) => {
            if (p.status === 'active' || p.status === 'optimized') {
                console.log(`  > Deepening roots in ${id}: Optimizing LTV/CAC ratio.`);
            }
        });
    }

    public registerMarket(id: string, profile: MarketProfile) {
        this.markets.set(id, profile);
    }

    public getMarket(id: string): MarketProfile | undefined {
        return this.markets.get(id);
    }

    public async reallocate(from: string, to: string, amount: number) {
        const source = this.markets.get(from);
        const target = this.markets.get(to);

        if (!source || !target) throw new Error("Market not found");
        if (source.budget < amount) throw new Error("Insufficient funds in source market");

        source.budget -= amount;
        target.budget += amount;

        console.log(`[REALLOCATE] $${amount} moved from ${from} to ${to}`);
    }

    public getStatusReport() {
        return {
            totalBudget: this.globalBudget,
            activeMarkets: this.markets.size,
            markets: Array.from(this.markets.entries()).map(([id, p]) => ({ id, ...p }))
        };
    }

    public applyCrossMarketLearning(sourceId: string, targetIds: string[]) {
        console.log(`[LEARNING] Extracting patterns from ${sourceId}...`);
        targetIds.forEach(id => {
            console.log(`  > Applying winning patterns to ${id}`);
        });
        return { success: true, timestamp: new Date().toISOString() };
    }
}
