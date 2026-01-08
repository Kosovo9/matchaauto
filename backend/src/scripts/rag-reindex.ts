
import { Pool } from "pg";
import { upsertListingEmbedding } from "../services/rag.service";
import { logger } from "../utils/logger";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function reindexAll() {
    logger.info("[REINDEX] Starting global RAG reindex...");

    try {
        const { rows } = await pool.query("SELECT id FROM listings");
        logger.info(`[REINDEX] Found ${rows.length} listings to process.`);

        for (const row of rows) {
            logger.info(`[REINDEX] Processing listing: ${row.id}...`);
            await upsertListingEmbedding(row.id);
        }

        logger.info("[REINDEX] Success! All listings reindexed with embeddings.");
    } catch (error) {
        logger.error("[REINDEX] Failed during reindex operation:", error);
    } finally {
        await pool.end();
    }
}

reindexAll();
