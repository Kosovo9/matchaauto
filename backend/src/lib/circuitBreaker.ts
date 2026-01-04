export enum CircuitBreakerState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
    failureThreshold: number;
    resetTimeout: number; // ms
    name?: string;
    fallback?: (...args: any[]) => Promise<any>;
}

export class CircuitBreaker {
    private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
    private failureCount = 0;
    private lastFailureTime: number | null = null;
    private name: string;

    constructor(private config: CircuitBreakerConfig) {
        this.name = config.name || 'default';
    }

    async execute<T>(fn: (...args: any[]) => Promise<T>, ...args: any[]): Promise<T> {
        if (this.state === CircuitBreakerState.OPEN) {
            if (this.lastFailureTime && Date.now() - this.lastFailureTime > this.config.resetTimeout) {
                this.state = CircuitBreakerState.HALF_OPEN;
            } else {
                if (this.config.fallback) return this.config.fallback(...args);
                throw new Error(`Circuit breaker "${this.name}" is OPEN`);
            }
        }

        try {
            const result = await fn(...args);
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            if (this.config.fallback) return this.config.fallback(...args);
            throw error;
        }
    }

    private onSuccess() {
        this.failureCount = 0;
        this.state = CircuitBreakerState.CLOSED;
    }

    private onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.config.failureThreshold) {
            this.state = CircuitBreakerState.OPEN;
            console.warn(`Circuit breaker "${this.name}" transition to OPEN`);
        }
    }

    getState() { return this.state; }
}

export class CircuitBreakerManager {
    private breakers = new Map<string, CircuitBreaker>();

    getBreaker(name: string, config: CircuitBreakerConfig): CircuitBreaker {
        if (!this.breakers.has(name)) {
            this.breakers.set(name, new CircuitBreaker(config));
        }
        return this.breakers.get(name)!;
    }
}
