
import { fetch } from 'undici';

const BASE_URL = 'http://localhost:3000/api';
const FRONTEND_URL = 'http://localhost';

async function checkHealth() {
    try {
        const res = await fetch(`${BASE_URL}/health`);
        const data = await res.json();
        return { status: res.status, data };
    } catch (e) {
        return { status: 'error', error: e.message };
    }
}

async function checkHybridAI() {
    try {
        const res = await fetch(`${BASE_URL}/helpdesk/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'verifier',
                question: 'bateria', // Trigger fallback response for reliability check
                forceOffline: true
            })
        });
        const data = await res.json();
        return { status: res.status, data };
    } catch (e) {
        return { status: 'error', error: e.message };
    }
}

async function checkFrontend() {
    try {
        const res = await fetch(FRONTEND_URL);
        return { status: res.status, contentType: res.headers.get('content-type') };
    } catch (e) {
        return { status: 'error', error: e.message };
    }
}

async function main() {
    console.log('🕵️ Iniciando Protocolo de Verificación Total (Antigravity v5.0)...');

    // 1. Backend Health
    console.log('\n[1/4] Verificando Backend Health...');
    const health = await checkHealth();
    if (health.status === 200) {
        console.log('✅ Backend: OPERATIVO', health.data);
    } else {
        console.error('❌ Backend: FALLO', health);
    }

    // 2. Hybrid AI (Offline Fallback Check)
    console.log('\n[2/4] Verificando AI Táctica (HelpDesk)...');
    const ai = await checkHybridAI();
    if (ai.status === 200 && ai.data.answer) {
        console.log('✅ AI HelpDesk: OPERATIVO', { source: ai.data.source, model: ai.data.model });
    } else {
        console.error('❌ AI HelpDesk: FALLO', ai);
    }

    // 3. Frontend Check
    console.log('\n[3/4] Verificando Interfaces Frontend...');
    const fe = await checkFrontend();
    if (fe.status === 200) {
        console.log('✅ Frontend: ACCESIBLE (Status 200)');
    } else {
        console.error('❌ Frontend: INACCESIBLE', fe);
    }

    console.log('\n🏁 Verificación Completa.');
}

main().catch(console.error);
