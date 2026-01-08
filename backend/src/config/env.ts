import { z } from 'zod';

export const EnvSchema = z.object({
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    GOOGLE_MAPS_API_KEY: z.string().optional(),
    INTERNAL_API_KEY: z.string().default('secret-10x'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    HUGGING_FACE_API_KEY: z.string().optional(),
    CLERK_PUBLISHABLE_KEY: z.string().optional(),
    CLERK_SECRET_KEY: z.string().optional(),
    ADMIN_USER_IDS: z.string().optional(),
    MERCADO_PAGO_ACCESS_TOKEN: z.string().optional(),
    PAYPAL_CLIENT_ID: z.string().optional(),
    PAYPAL_CLIENT_SECRET: z.string().optional(),
    PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
    PAYPAL_WEBHOOK_ID: z.string().optional(),
    BACKEND_URL: z.string().default('http://localhost:3000'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
});

export type Env = z.infer<typeof EnvSchema>;

export const validateEnv = (env: any): Env => {
    const parsed = EnvSchema.safeParse(env);
    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
        throw new Error('Invalid environment variables');
    }
    return parsed.data;
};
