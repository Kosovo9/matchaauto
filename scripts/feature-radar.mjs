// scripts/feature-radar.mjs
// "Nivel Dios" Feature Radar v3 — Match Autos Trinity (Auto + Marketplace + Assets)
// Generates: feature-radar-report.json (+ optional repo-files manifest)
// Includes: SQL Deep Scan Extension
//
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const args = new Set(process.argv.slice(2));
const WRITE_FILES_MANIFEST = args.has("--writeFilesManifest");
const MAX_ORPHANS = (() => {
    const a = process.argv.find((x) => x.startsWith("--maxOrphans="));
    return a ? Math.max(10, Number(a.split("=")[1]) || 200) : 200;
})();

const exDirs = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo", ".vercel", ".netlify", "coverage", ".cache"]);
const includeExt = /\.(tsx|ts|jsx|js|mjs|cjs|json|sql|yml|yaml|md|toml)$/i;

function walk(dir, out = []) {
    let ents = [];
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
    for (const ent of ents) {
        if (ent.isDirectory()) {
            if (exDirs.has(ent.name)) continue;
            walk(path.join(dir, ent.name), out);
        } else if (includeExt.test(ent.name)) {
            out.push(path.join(dir, ent.name));
        }
    }
    return out;
}

function rel(p) { return p.replace(ROOT, "").replaceAll("\\", "/"); }
function sha1(s) { return crypto.createHash("sha1").update(s).digest("hex"); }
function safeRead(p) { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } }

// --------------------
// Patterns (high-signal)
// --------------------
const re = {
    appRoute: /(^|\/)app\/(.+?)\/page\.(tsx|ts|jsx|js)$/i,
    layout: /(^|\/)app\/(.+?)\/layout\.(tsx|ts|jsx|js)$/i,
    nextLink: /<Link[^>]+href\s*=\s*["'`]([^"'`]+)["'`]/g,
    hrefAttr: /\bhref\s*=\s*["'`]([^"'`]+)["'`]/g,
    routerPush: /\b(router\.push|navigate)\(\s*["'`]([^"'`]+)["'`]/g,
    buttonTag: /<button\b[^>]*>[\s\S]*?<\/button>/gi,
    onClick: /\bonClick\s*=\s*\{/,
    fetchCall: /\bfetch\(\s*["'`]([^"'`]+)["'`]/g,
    expressRoute: /\b(app|router)\.(get|post|put|delete|patch)\(\s*["'`]([^"'`]+)["'`]/g,

    // SQL Signals
    pgvector: /\bCREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+vector\b/i,
    postgis: /\bCREATE\s+EXTENSION\s+IF\s+NOT\s+EXISTS\s+postgis\b/i,
    stdwithin: /\bST_DWithin\b/i,

    // Feature signals
    flags: /\b(feature\s*flags?|flags\.|FEATURE_|isEnabled\(|registry)\b/i,
    moderation: /\b(moderation|nsfw|porn|weapon|abuse|toxicity)\b/i,
    messaging: /\b(message|messaging|chat|inbox|thread|conversation)\b/i,

    // SQL Structural patterns
    sqlCreateTable: /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi,
    sqlCreateFunction: /\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(\w+)/gi,
    sqlCreateTrigger: /\bCREATE\s+TRIGGER\s+(\w+)/gi,
    sqlAlterTable: /\bALTER\s+TABLE\s+(\w+)/gi,
};

const sqlEntities = {
    tables: new Map(), // name -> file
    functions: new Map(),
    triggers: new Map(),
};

const files = walk(ROOT);
const filesRel = files.map(rel);
if (WRITE_FILES_MANIFEST) fs.writeFileSync(path.join(ROOT, "repo-files.txt"), filesRel.join("\n"));

const frontend = { appRoutes: [], apiCalls: [], buttons: [] };
const backend = { endpoints: [] };
const orphans = [];
const featureEvidence = new Map();

// 1. Pass: Collect SQL Entities
for (const abs of files) {
    if (!abs.endsWith(".sql")) continue;
    const txt = safeRead(abs);
    let m;
    while ((m = re.sqlCreateTable.exec(txt))) sqlEntities.tables.set(m[1].toLowerCase(), rel(abs));
    while ((m = re.sqlCreateFunction.exec(txt))) sqlEntities.functions.set(m[1].toLowerCase(), rel(abs));
    while ((m = re.sqlCreateTrigger.exec(txt))) sqlEntities.triggers.set(m[1].toLowerCase(), rel(abs));
}

// 2. Pass: Cross-reference and Scan
const allCode = [];
for (const abs of files) {
    const rp = rel(abs);
    const txt = safeRead(abs);
    if (!txt || rp.endsWith(".sql") || rp.includes("node_modules")) continue;
    allCode.push({ rp, txt });

    // Basic signals
    if (re.appRoute.test(rp)) frontend.appRoutes.push(rp);
    if (re.expressRoute.test(txt)) backend.endpoints.push(rp);
}

const allTxtCombined = allCode.map(x => x.txt).join("\n");

// 3. Find Unused SQL Entities
const unusedTables = [];
for (const [name, file] of sqlEntities.tables.entries()) {
    if (!allTxtCombined.toLowerCase().includes(name)) {
        unusedTables.push({ name, file, type: "unused_table" });
    }
}

const unusedFunctions = [];
for (const [name, file] of sqlEntities.functions.entries()) {
    if (!allTxtCombined.toLowerCase().includes(name)) {
        unusedFunctions.push({ name, file, type: "unused_function" });
    }
}

// 4. Activity Check (Git)
// This will be handled by the AI using the generated report and git log commands.

const report = {
    generatedAt: new Date().toISOString(),
    counts: {
        files: files.length,
        sql: {
            tables: sqlEntities.tables.size,
            unusedTables: unusedTables.length,
            functions: sqlEntities.functions.size,
            unusedFunctions: unusedFunctions.length,
        }
    },
    orphans: {
        unusedTables,
        unusedFunctions
    },
    featureRadar: {
        sqlEvidence: Array.from(sqlEntities.tables.keys()).filter(t => t.includes("boost") || t.includes("moderate") || t.includes("message") || t.includes("escrow"))
    }
};

fs.writeFileSync(path.join(ROOT, "feature-radar-report.json"), JSON.stringify(report, null, 2));
console.log("✅ Generated feature-radar-report.json with SQL Deep Scan");
console.log(`Found ${sqlEntities.tables.size} tables, ${unusedTables.length} look unused.`);
