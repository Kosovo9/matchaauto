#!/usr/bin/env node

/**
 * 🚀 QUANTUM PRODUCTION SYNC
 * Este script sincroniza automáticamente tus variables de entorno locales
 * con los servicios de producción (Cloudflare y Netlify).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function syncProduction() {
    console.log("🌌 Iniciando Sincronización Cuántica de Producción...");

    // 1. Verificar existencia de .dev.vars en backend
    const backendVarsPath = path.join(__dirname, 'backend', '.dev.vars');
    if (fs.existsSync(backendVarsPath)) {
        console.log("📡 Detectadas variables de Backend. Sincronizando con Cloudflare Workers...");
        try {
            // Este comando requiere Wrangler instalado y logueado
            execSync('cd backend && npx wrangler secret:bulk .dev.vars', { stdio: 'inherit' });
            console.log("✅ Secretos de Cloudflare Sincronizados.");
        } catch (e) {
            console.log("⚠️ Error sincronizando Cloudflare. Asegúrate de estar logueado en Wrangler.");
        }
    }

    // 2. Sincronizar Frontend con Netlify
    const frontendVarsPath = path.join(__dirname, 'frontend', '.env.local');
    if (fs.existsSync(frontendVarsPath)) {
        console.log("🌐 Detectadas variables de Frontend. Sincronizando con Netlify...");
        try {
            // Importar variables a Netlify
            execSync('npx netlify env:import frontend/.env.local', { stdio: 'inherit' });
            console.log("✅ Variables de Netlify Sincronizadas.");
        } catch (e) {
            console.log("⚠️ Error sincronizando Netlify. Asegúrate de tener Netlify CLI instalado.");
        }
    }

    console.log("🔥 Sincronización Completa. El imperio está en línea.");
}

syncProduction();
