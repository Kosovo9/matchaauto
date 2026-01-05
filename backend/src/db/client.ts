import { drizzle } from 'drizzle-orm/d1';

export const createDbClient = (env: any) => {
    return drizzle(env.DB);
};

export type DbClient = ReturnType<typeof createDbClient>;
