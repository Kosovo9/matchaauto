
export class CircuitBreaker {
    constructor(nameOrConfig: any, config?: any) { }
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        return fn();
    }
}
