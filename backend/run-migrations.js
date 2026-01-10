import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Hardcoded for reliability in this specific session
const connectionString = "postgresql://matchauto:securepassword@localhost:5432/matchauto";

const pool = new Pool({
    connectionString
});

async function runSql(filename) {
    const filePath = path.join(__dirname, '..', filename);
    console.log(`🚀 Executing ${filePath}...`);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }
    const sql = fs.readFileSync(filePath, 'utf8');
    try {
        await pool.query(sql);
        console.log(`✅ ${filename} executed successfully.`);
    } catch (err) {
        console.error(`❌ Error executing ${filename}:`, err);
    }
}

async function main() {
    await runSql('backend/sql/001_rewards.sql');
    await runSql('backend/sql/002_affiliates.sql');
    await pool.end();
}

main().catch(console.error);
