import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function listTables() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Existing tables:', res.rows.map(r => r.table_name));
    } catch (error) {
        console.error('Failed to list tables:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

listTables();
