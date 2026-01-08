import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// --- Configuration ---
const REPORT_DIR = path.join(projectRoot, 'reports');
if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

const OUTPUT_JSON = path.join(REPORT_DIR, 'feature-radar-report.json');

// --- Surgical Scan Configuration ---

// Defaults
let ALLOW_LIST = ['backend', 'frontend', 'shared', 'docker', 'postgres', 'scripts'];
let IGNORE_LIST = [
    'node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'reports',
    'world-assets-exchange', '_features_10x', '_legacy_configs', '_meta', 'community-resilience'
];

// Load .radarignore if it exists
const radarIgnorePath = path.join(projectRoot, '.radarignore');
if (fs.existsSync(radarIgnorePath)) {
    const ignoreContent = fs.readFileSync(radarIgnorePath, 'utf-8');
    const customIgnores = ignoreContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    IGNORE_LIST = [...new Set([...IGNORE_LIST, ...customIgnores])];
    console.log(`Loaded custom excludes from .radarignore`);
}

// Helper Functions
function runCmd(cmd, cwd = projectRoot) {
    try {
        return execSync(cmd, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch (e) {
        return '';
    }
}

// Ensure Strict Single Root
function verifySingleRoot() {
    const rootCandidates = [];
    const dirs = fs.readdirSync(projectRoot);

    dirs.forEach(dir => {
        const fullPath = path.join(projectRoot, dir);
        if (!fs.statSync(fullPath).isDirectory()) return;
        if (IGNORE_LIST.includes(dir)) return;

        // Naive check: if it has package.json AND is not in allowlist, it might be a nested root
        if (fs.existsSync(path.join(fullPath, 'package.json')) && !ALLOW_LIST.includes(dir)) {
            rootCandidates.push(dir);
        }
    });

    if (rootCandidates.length > 0) {
        console.warn(`\n⚠️  WARNING: Potential specific nested roots detected: ${rootCandidates.join(', ')}`);
        console.warn(`This radar run is enforcing SURGICAL mode on: [${ALLOW_LIST.join(', ')}]`);
        console.warn(`Ignoring content in: ${rootCandidates.join(', ')}\n`);
    }
}

// Get files explicitly
function getSurgicalFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);

        // If it's the root dir, we loop
        if (dirPath === projectRoot) {
            // Ignore if in ignore list
            if (IGNORE_LIST.includes(file)) return;
            // If directory NOT in allow list and is a directory, SKIP (unless it's a file in root)
            if (fs.statSync(fullPath).isDirectory() && !ALLOW_LIST.includes(file)) return;
        }

        if (fs.statSync(fullPath).isDirectory()) {
            if (IGNORE_LIST.includes(file)) return;
            if (file === 'node_modules' || file === '.git') return;
            arrayOfFiles = getSurgicalFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// --- Main Execution ---

console.log('--- Starting Surgical Feature Radar ---');

// 1. Root Verification
console.log('[1/5] Verifying Root...');
const gitRoot = runCmd('git rev-parse --show-toplevel');
console.log(`Repo Root: ${projectRoot}`);
verifySingleRoot();

// 2. Surgical File Collection
console.log('[2/5] Collecting Files (Surgical Mode)...');
const allFiles = getSurgicalFiles(projectRoot);
const sqlFiles = allFiles.filter(f => f.endsWith('.sql'));
const codeFiles = allFiles.filter(f =>
    (f.endsWith('.ts') || f.endsWith('.tsx') || f.endsWith('.js')) &&
    !f.includes('node_modules')
);

console.log(`Scan Scope: ${allFiles.length} files (${sqlFiles.length} SQL, ${codeFiles.length} Code)`);


// --- Helper Regex & Count ---
function normalizeSqlIdent(raw) {
    if (!raw) return raw;
    return raw.replace(/"/g, '').trim();
}

function countRefsInFiles(entityName, files) {
    if (!entityName) return 0;
    // Escape regex special chars in entity name
    const re = new RegExp(`\\b${entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    let refs = 0;
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (re.test(content)) refs++;
    }
    return refs;
}

// 3. SQL Scan
console.log('[3/5] Scanning SQL for Hidden Features (Advanced)...');

const sqlEntities = {
    tables: [],
    functions: [],
    triggers: [],
    indexes: []
};

// Advanced regex for schema.table support
const TABLE_REGEX = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?([a-zA-Z0-9_]+)"?)\.)?(?:"?([a-zA-Z0-9_]+)"?)/gi;
const FUNCTION_REGEX = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:"?([a-zA-Z0-9_]+)"?)\.)?(?:"?([a-zA-Z0-9_]+)"?)/gi;
const TRIGGER_REGEX = /CREATE\s+TRIGGER\s+(?:(?:"?([a-zA-Z0-9_]+)"?)\.)?(?:"?([a-zA-Z0-9_]+)"?)/gi;

sqlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');

    // Tables
    const tableMatches = [...content.matchAll(TABLE_REGEX)];
    tableMatches.forEach(m => {
        const schema = normalizeSqlIdent(m[1] || '');
        const name = normalizeSqlIdent(m[2]);
        const full = schema ? `${schema}.${name}` : name;
        if (name && name.toUpperCase() !== 'IF' && name.toUpperCase() !== 'NOT' && name.toUpperCase() !== 'EXISTS') {
            sqlEntities.tables.push({ name, fullName: full, file: path.relative(projectRoot, file) });
        }
    });

    // Functions
    const funcMatches = [...content.matchAll(FUNCTION_REGEX)];
    funcMatches.forEach(m => {
        const schema = normalizeSqlIdent(m[1] || '');
        const name = normalizeSqlIdent(m[2]);
        const full = schema ? `${schema}.${name}` : name;
        // Basic filter for keywords often matched by loose regex
        if (name && name.toUpperCase() !== 'OR' && name.toUpperCase() !== 'REPLACE') {
            sqlEntities.functions.push({ name, fullName: full, file: path.relative(projectRoot, file) });
        }
    });

    // Triggers
    const triggerMatches = [...content.matchAll(TRIGGER_REGEX)];
    triggerMatches.forEach(m => {
        const schema = normalizeSqlIdent(m[1] || '');
        const name = normalizeSqlIdent(m[2]);
        const full = schema ? `${schema}.${name}` : name;
        sqlEntities.triggers.push({ name, fullName: full, file: path.relative(projectRoot, file) });
    });
});

// Deduplicate
sqlEntities.tables = [...new Set(sqlEntities.tables.map(JSON.stringify))].map(JSON.parse);
sqlEntities.functions = [...new Set(sqlEntities.functions.map(JSON.stringify))].map(JSON.parse);

// 4. Codebase Usage Scan
console.log('[4/5] Checking Codebase & Internal SQL Usage...');

const unusedEntities = {
    tables: [],
    functions: []
};

// Check Tables: Referenced in Code?
sqlEntities.tables.forEach(t => {
    const codeRefs = countRefsInFiles(t.name, codeFiles) + (t.fullName !== t.name ? countRefsInFiles(t.fullName, codeFiles) : 0);
    // Optional: check SQL refs too for foreign keys or views? For now, if unused in code, it's a "zombie feature candidate"
    if (codeRefs === 0) {
        unusedEntities.tables.push({ ...t, codeRefs });
    }
});

// Check Functions: Referenced in Code OR other SQL?
sqlEntities.functions.forEach(f => {
    // Check references in code
    const codeRefs = countRefsInFiles(f.name, codeFiles) + (f.fullName !== f.name ? countRefsInFiles(f.fullName, codeFiles) : 0);
    // Check references in SQL (e.g. triggers calling the function)
    const sqlRefs = countRefsInFiles(f.name, sqlFiles) + (f.fullName !== f.name ? countRefsInFiles(f.fullName, sqlFiles) : 0);

    // Logic: A function is "Defined" once in SQL. If it appears <= 1 time in SQL (just definition) AND 0 times in code, it is orphaned.
    // If it appears > 1 in SQL, it's likely used by a trigger.
    if (codeRefs === 0 && sqlRefs <= 1) {
        unusedEntities.functions.push({ ...f, codeRefs, sqlRefs });
    }
});

// 5. Generate Reports
console.log('[5/5] Generating JSON Report...');

const radarReport = {
    timestamp: new Date().toISOString(),
    projectRoot,
    scanStrategy: 'Surgical (Allowlist + .radarignore)',
    stats: {
        totalFilesScanned: allFiles.length,
        totalTables: sqlEntities.tables.length,
        unusedTables: unusedEntities.tables.length,
        totalFunctions: sqlEntities.functions.length,
        unusedFunctions: unusedEntities.functions.length
    },
    hiddenFeatures: {
        unusedTables: unusedEntities.tables,
        unusedFunctions: unusedEntities.functions
    },
    possibleDuplications: []
};

// Check duplication risks
if (sqlEntities.tables.find(t => t.name === 'marketplace_items') && sqlEntities.tables.find(t => t.name === 'listings')) {
    radarReport.possibleDuplications.push('marketplace_items vs listings');
}

fs.writeFileSync(OUTPUT_JSON, JSON.stringify(radarReport, null, 2));

console.log('--- Surgical Feature Radar Complete ---');
console.log(`JSON Report saved to: ${OUTPUT_JSON}`);
