import { Pool } from 'pg';

export const setupDatabase = (env: any) => {
    const isProduction = env.NODE_ENV === 'production' || env.APP_ENV === 'staging';

    const poolConfig: any = {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

    if (env.DATABASE_URL) {
        // Preferred for Production (from Secret Manager)
        poolConfig.connectionString = env.DATABASE_URL;
    } else if (env.INSTANCE_UNIX_SOCKET) {
        // Direct socket params fallback
        poolConfig.host = env.INSTANCE_UNIX_SOCKET;
        poolConfig.user = env.DB_USER;
        poolConfig.password = env.DB_PASS;
        poolConfig.database = env.DB_NAME;
    }

    // SSL logic: Cloud Run sockets don't need it, but Cloud SQL external IP does.
    // If using ?host=/cloudsql/... query param in DATABASE_URL, pg handles it.
    if (isProduction && poolConfig.connectionString && !poolConfig.connectionString.includes('host=')) {
        poolConfig.ssl = { rejectUnauthorized: false };
    }

    return new Pool(poolConfig);
};
