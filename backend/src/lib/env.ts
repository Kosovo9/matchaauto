import { z } from 'zod';

export const EnvSchema = z.object({
    // Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    API_ENVIRONMENT: z.string().default('production'),
    VERSION: z.string().default('1.0.0'),

    // Solana
    SOLANA_RPC_URL: z.string().url(),
    SOLANA_NETWORK: z.enum(['mainnet-beta', 'devnet', 'testnet']).default('mainnet-beta'),

    // Clerk
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),

    // Monitoring
    SENTRY_DSN: z.string().url().optional(),
    LOGFLARE_API_KEY: z.string().optional(),
    LOGFLARE_ENDPOINT: z.string().optional(),

    // AI
    AI_TOXICITY_THRESHOLD: z.coerce.number().default(0.8),
    HF_TOKEN: z.string().optional(),
    GOOGLE_AI_API_KEY: z.string().optional(),

    // Security
    SENTINEL_MODE: z.enum(['active', 'passive']).default('active'),
    B2B_KEYS: z.any().optional(), // KV
    VIRAL_DATA: z.any().optional(), // KV
    RATE_LIMIT_STORE: z.any().optional(), // DO
    DB: z.any().optional(), // D1
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (env: any): Env => {
    try {
        return EnvSchema.parse(env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const missingKeys = (error as any).errors.map((e: any) => e.path.join('.')).join(', ');
            throw new Error(`Invalid Environment Configuration. Missing or invalid keys: ${missingKeys}`);
        }
        throw error;
    }
};
