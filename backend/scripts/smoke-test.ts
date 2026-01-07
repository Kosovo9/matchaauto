// Set dummy envs for smoke test to bypass validation
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NODE_ENV = 'test';

import app from '../src/index.js';
import pkg from 'pg';
const { Pool } = pkg;
import Redis from 'ioredis';

// Mocks para evitar errores de conexión durante el smoke test
const mockPool = {} as any;
const mockRedis = {} as any;

async function runTests() {
    // Wait for async start() in index.ts
    await new Promise(r => setTimeout(r, 1000));
    console.log('🧪 SMOKE TEST: Community Resilience Endpoints (Simulated)');

    // 1. Test: Activate Visibility
    console.log('\n--- Test 1: Activate Visibility ---');
    const res1 = await app.request('/api/resilience/visibility/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            signalId: 'test-signal-123',
            type: 'offer-top3',
            region: 'MX',
            durationDays: 7
        })
    });
    console.log('Status:', res1.status);
    const data1 = await res1.json();
    console.log('Response:', JSON.stringify(data1, null, 2));

    // 2. Test: Get Matching
    console.log('\n--- Test 2: Search Matches ---');
    const res2 = await app.request('/api/resilience/matching/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            signal: {
                id: 'test-req-456',
                category: 'agriculture',
                location: { lat: 28.633, lng: -106.069 }
            }
        })
    });
    console.log('Status:', res2.status);
    const data2 = await res2.json();
    console.log('Response:', JSON.stringify(data2, null, 2));

    // 3. Test: Generate Voucher
    console.log('\n--- Test 3: Generate Voucher ---');
    const res3 = await app.request('/api/resilience/payment/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 2.50,
            region: 'MX',
            type: 'request-alert'
        })
    });
    console.log('Status:', res3.status);
    const data3 = await res3.json();
    console.log('Response:', JSON.stringify(data3, null, 2));

    console.log('\n🏁 Smoke test completed.');
}

runTests().catch(console.error);
