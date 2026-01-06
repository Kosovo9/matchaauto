import { z } from 'zod';

export const EnvSchema = z.object({
    DATABASE_URL: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    GOOGLE_MAPS_API_KEY: z.string().optional(),
    INTERNAL_API_KEY: z.string().default('secret-10x'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3000'),
    HUGGING_FACE_API_KEY: z.string().optional(),
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
