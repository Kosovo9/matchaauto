import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const exDirs = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo", ".vercel", ".netlify", "coverage"]);

function walk(dir, out = []) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.isDirectory()) {
            if (exDirs.has(ent.name)) continue;
            walk(path.join(dir, ent.name), out);
        } else {
            const p = path.join(dir, ent.name);
            if (/\.(tsx?|jsx?)$/.test(ent.name)) out.push(p);
        }
    }
    return out;
}

const files = walk(ROOT);
const routes = [];
const apiCalls = [];
const buttons = [];

const routeRe = /(href=|router\.push\(|navigate\(|Link\s+href=)\s*["'`](\/[^"'` )]+)/g;
const apiRe = /(fetch\(|axios\.(get|post|put|delete)\(|apiClient\.)\s*["'`](\/api\/[^"'` )]+)/g;
const buttonRe = /<button[^>]*>([\s\S]*?)<\/button>/g;

for (const f of files) {
    const txt = fs.readFileSync(f, "utf8");

    // routes
    let m;
    while ((m = routeRe.exec(txt))) routes.push({ file: f.replace(ROOT, ""), route: m[2] });

    // api calls
    while ((m = apiRe.exec(txt))) apiCalls.push({ file: f.replace(ROOT, ""), call: m[0].slice(0, 120) });

    // naive buttons: detects presence + tries to see if onClick exists nearby
    let b;
    while ((b = buttonRe.exec(txt))) {
        const chunk = txt.slice(Math.max(0, b.index - 200), Math.min(txt.length, b.index + 400));
        const hasOnClick = /onClick\s*=/.test(chunk);
        buttons.push({ file: f.replace(ROOT, ""), hasOnClick, sample: b[0].slice(0, 120).replace(/\s+/g, " ") });
    }
}

const report = {
    generatedAt: new Date().toISOString(),
    counts: {
        files: files.length, routes: routes.length, apiCalls: apiCalls.length, buttons: buttons.length,
        deadButtons: buttons.filter(x => !x.hasOnClick).length
    },
    top: {
        deadButtons: buttons.filter(x => !x.hasOnClick).slice(0, 50),
        routes: routes.slice(0, 200),
        apiCalls: apiCalls.slice(0, 200),
    }
};

fs.writeFileSync(path.join(ROOT, "feature-audit-report.json"), JSON.stringify(report, null, 2));
console.log("✅ Generated feature-audit-report.json");
console.log("Buttons:", report.counts.buttons, "Dead:", report.counts.deadButtons);
console.log("Routes:", report.counts.routes, "API calls:", report.counts.apiCalls);
