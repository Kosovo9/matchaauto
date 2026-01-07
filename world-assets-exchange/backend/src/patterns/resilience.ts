import { logger } from './logger';

export class CircuitBreaker {
    private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
    private failures = 0;
    private lastFailureTime = 0;
    private options: {
        failureThreshold: number;
        resetTimeout: number;
        timeout: number;
    };

    constructor(options = { failureThreshold: 5, resetTimeout: 60000, timeout: 10000 }) {
        this.options = options;
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }

        try {
            const result = await Promise.race([
                fn(),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Operation timed out')), this.options.timeout)
                )
            ]);

            this.onSuccess();
            return result as T;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess() {
        this.failures = 0;
        this.state = 'CLOSED';
    }

    private onFailure() {
        this.failures++;
        this.lastFailureTime = Date.now();
        if (this.failures >= this.options.failureThreshold) {
            this.state = 'OPEN';
            logger.error('Circuit Breaker transitioned to OPEN state');
        }
    }
}

export class RetryPolicy {
    static async retry<T>(
        fn: () => Promise<T>,
        retries = 3,
        delay = 1000
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.retry(fn, retries - 1, delay * 2);
        }
    }
}
