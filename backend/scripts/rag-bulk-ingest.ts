
import { createRequire } from 'module';
import { Pool } from 'pg';
import { UniversalRAGService } from '../src/services/ai/universal-rag.service';
import { config } from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
config({ path: resolve(__dirname, '../.env') });

const require = createRequire(import.meta.url);
const fs = require('fs').promises;
const path = require('path');

// Configuración de base de datos directa para el script
const pgPool = new Pool({
    connectionString: process.env.POSTGRES_URL || 'postgresql://matchauto:securepassword@localhost:5432/matchauto'
});

const ragService = new UniversalRAGService(pgPool);

// Mapeo de carpetas a dominios
// Asegúrate de crear estas carpetas en la raíz del proyecto: /data/rag/mechanic, etc.
const DATA_ROOT = resolve(__dirname, '../../data/rag');
const DOMAIN_FOLDERS = ['mechanic', 'legal', 'seeds', 'health', 'survival'];

async function processFile(filePath: string, domain: string) {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const filename = path.basename(filePath);
        const id = `${domain}:${filename}`;

        console.log(`🧠 Processing: ${filename} for domain [${domain}]...`);

        await ragService.ingestDocument({
            id,
            content,
            metadata: { source: 'file-system', filename }
        }, domain);

        console.log(`✅ Ingested: ${filename}`);
    } catch (error) {
        console.error(`❌ Failed to ingest ${filePath}:`, error);
    }
}

async function main() {
    console.log('🚀 Starting Massive RAG Ingestion...');

    // Esperar a que el embedder cargue
    await new Promise(resolve => setTimeout(resolve, 3000));

    for (const domain of DOMAIN_FOLDERS) {
        const domainPath = path.join(DATA_ROOT, domain);
        try {
            // Verificar si carpeta existe
            await fs.access(domainPath);

            const files = await fs.readdir(domainPath);
            for (const file of files) {
                if (file.endsWith('.txt') || file.endsWith('.md') || file.endsWith('.json')) {
                    await processFile(path.join(domainPath, file), domain);
                }
            }
        } catch (error) {
            console.warn(`⚠️  Skipping domain [${domain}] (folder not found at ${domainPath})`);
        }
    }

    console.log('🏁 Bulk Ingestion Complete.');
    await pgPool.end();
}

main().catch(console.error);
