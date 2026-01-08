
import { Pool } from "pg";
import { embedText } from "./embeddings.service";

// Nota: En una app real, el pool se inyectaría o se importaría de una config centralizada.
// Para este patch funcional, asumimos la conexión vía ENV.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function listingDoc(row: any) {
    const attrs = row.attrs ? JSON.stringify(row.attrs) : "";
    return `${row.domain}\nTITLE: ${row.title}\nDESC: ${row.description ?? ""}\nCITY:${row.city ?? ""}\nSTATE:${row.state ?? ""}\nATTRS:${attrs}`.slice(0, 4000);
}

export async function upsertListingEmbedding(listingId: string) {
    const { rows } = await pool.query("SELECT * FROM listings WHERE id=$1", [listingId]);
    if (!rows[0]) return;

    const doc = listingDoc(rows[0]);
    const emb = await embedText(doc);

    await pool.query("UPDATE listings SET embedding=$1, updated_at=now() WHERE id=$2", [emb, listingId]);
}

type RagSearchParams = {
    domain: "auto" | "marketplace" | "assets";
    q: string;
    limit?: number;
    priceMin?: number;
    priceMax?: number;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
};

export async function ragSearch(p: RagSearchParams) {
    const limit = Math.min(Math.max(p.limit ?? 24, 1), 50);
    const qEmb = await embedText(`${p.domain} search: ${p.q}`);

    const where: string[] = ["domain = $1", "embedding IS NOT NULL"];
    const args: any[] = [p.domain, qEmb, limit];
    let idx = 4;

    if (p.priceMin != null) { where.push(`price >= $${idx++}`); args.push(p.priceMin); }
    if (p.priceMax != null) { where.push(`price <= $${idx++}`); args.push(p.priceMax); }
    if (p.city) { where.push(`city ILIKE $${idx++}`); args.push(`%${p.city}%`); }
    if (p.state) { where.push(`state ILIKE $${idx++}`); args.push(`%${p.state}%`); }

    // 🌍 HYBRID SCORING (Semantic 0.7 + Geo 0.3)
    let scoreExpr = `1 - (embedding <=> $2::vector)`;

    if (p.lat != null && p.lng != null && p.radiusKm != null) {
        const radiusM = p.radiusKm * 1000;
        const geoPoint = `ST_SetSRID(ST_MakePoint($${idx}, $${idx + 1}), 4326)::geography`;
        where.push(`ST_DWithin(geom::geography, ${geoPoint}, $${idx + 2})`);

        // Boost factor: 1 - (dist / radius) -> 1 is centered, 0 is at edge
        const geoScoreExpr = `(1 - LEAST(1, ST_Distance(geom::geography, ${geoPoint}) / $${idx + 2}))`;
        scoreExpr = `(0.7 * (${scoreExpr}) + 0.3 * ${geoScoreExpr})`;

        args.push(p.lng, p.lat, radiusM);
        idx += 3;
    }

    const sql = `
    SELECT id, domain, title, price, currency, city, state, attrs,
           ST_X(geom) as lng, ST_Y(geom) as lat,
           ${scoreExpr} AS score
    FROM listings
    WHERE ${where.join(" AND ")}
    ORDER BY score DESC
    LIMIT $3
  `;

    const { rows } = await pool.query(sql, args);
    return { items: rows };
}
