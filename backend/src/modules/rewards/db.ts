import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://matchauto:securepassword@localhost:5432/matchauto",
});

export async function q<T = any>(text: string, params: any[] = []) {
    const res = await pool.query(text, params);
    return res.rows as T[];
}
