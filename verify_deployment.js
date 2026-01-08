const http = require('http');

const CONFIG = {
    frontend: {
        name: 'Frontend (Next.js)',
        url: 'http://localhost:80',
        timeout: 5000
    },
    backend: {
        name: 'Backend (Hono API)',
        url: 'http://localhost:3000/api/health',
        timeout: 5000
    },
    redis: {
        name: 'Redis',
        // We can't directly check redis via HTTP, but we can infer from backend health or just assume docker status
        // A better way is if backend has a deep health check.
        // For now, we will skip direct redis check in this node script without extra libs.
    }
};

async function checkService(name, url, timeout) {
    return new Promise((resolve) => {
        const start = Date.now();
        const req = http.get(url, { timeout }, (res) => {
            const time = Date.now() - start;
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`✅ [PASS] ${name} is UP (${res.statusCode}) - ${time}ms`);
                resolve(true);
            } else {
                console.log(`❌ [FAIL] ${name} returned status ${res.statusCode} - ${time}ms`);
                resolve(false);
            }
        });

        req.on('error', (err) => {
            console.log(`❌ [FAIL] ${name} is DOWN. Error: ${err.message}`);
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`❌ [FAIL] ${name} TIMEOUT after ${timeout}ms`);
            resolve(false);
        });
    });
}

async function runVerification() {
    console.log("🚀 Starting Automatic Deployment Verification...");
    console.log("================================================");

    // 1. Check Docker Containers (Requires docker CLI)
    // We assume this script runs in an env where docker is available, but if not we skip
    const { exec } = require('child_process');

    await new Promise((resolve) => {
        exec('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"', (error, stdout, stderr) => {
            if (error) {
                console.log("⚠️  Could not run 'docker ps' (Environment issue?)");
            } else {
                console.log("\n🐳 Docker Containers Status:");
                console.log(stdout);
            }
            resolve();
        });
    });

    console.log("------------------------------------------------");

    // 2. Check HTTP Services
    const frontendOk = await checkService(CONFIG.frontend.name, CONFIG.frontend.url, CONFIG.frontend.timeout);
    const backendOk = await checkService(CONFIG.backend.name, CONFIG.backend.url, CONFIG.backend.timeout);

    console.log("================================================");
    if (frontendOk && backendOk) {
        console.log("🎉 DEPLOYMENT VERIFIED: SYSTEM IS FULLY OPERATIONAL!");
        process.exit(0);
    } else {
        console.log("⚠️  DEPLOYMENT ISSUES DETECTED. Check logs above.");
        process.exit(1);
    }
}

runVerification();
