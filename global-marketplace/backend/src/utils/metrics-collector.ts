
export class MetricsCollector {
    private static instance: MetricsCollector;
    constructor(prefix?: string) { }
    static getInstance() {
        if (!MetricsCollector.instance) MetricsCollector.instance = new MetricsCollector();
        return MetricsCollector.instance;
    }
    async increment(metric: string, tags?: any) { console.log(`Metric: ${metric}++`, tags); }
    async timing(metric: string, value: number, tags?: any) { }
}
