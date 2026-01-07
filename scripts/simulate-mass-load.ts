
import axios from 'axios';

/**
 * 💥 MASS LOAD SIMULATOR - NEXUS SHIELD STRESS TEST
 * Targets the backend with high-frequency updates to trigger infrastructure metrics.
 */

const API_URL = 'http://localhost:8787/api/v1/tracking/position';
const TOTAL_REQUESTS = 5000;
const CONCURRENCY = 50; // Simultaneous workers

const locations = [
    { lat: 40.7128, lng: -74.0060, name: 'NYC' },
    { lat: 19.4326, lng: -99.1332, name: 'MEX' },
    { lat: 48.8566, lng: 2.3522, name: 'PAR' }
];

async function simulateTraffic(workerId: number) {
    console.log(`👷 Worker ${workerId} initialized.`);
    for (let i = 0; i < TOTAL_REQUESTS / CONCURRENCY; i++) {
        const loc = locations[i % locations.length];
        const payload = {
            vehicleId: `MASS-${workerId}-${i}`,
            lat: loc.lat + (Math.random() - 0.5) * 0.1,
            lng: loc.lng + (Math.random() - 0.5) * 0.1,
            speed: Math.random() * 120,
            timestamp: new Date().toISOString(),
            status: 'moving'
        };

        try {
            await axios.post(API_URL, payload, { timeout: 2000 });
            if (i % 10 === 0) process.stdout.write('⚡');
        } catch (error) {
            process.stdout.write('💀');
        }

        // No sleep = Maximum pressure
    }
}

console.log(`\n🔥 [STRESS TEST] Launching ${CONCURRENCY} workers for ${TOTAL_REQUESTS} total hits...`);
console.log(`🎯 Target: ${API_URL}\n`);

const start = Date.now();
const workers = Array.from({ length: CONCURRENCY }).map((_, i) => simulateTraffic(i));

Promise.all(workers).then(() => {
    const duration = (Date.now() - start) / 1000;
    console.log(`\n\n✅ TEST COMPLETE`);
    console.log(`⏱️ Duration: ${duration.toFixed(2)}s`);
    console.log(`🚀 Throughput: ${(TOTAL_REQUESTS / duration).toFixed(0)} req/s`);
    console.log(`\nCheck the Nexus Shield in the Dashboard. Is it red yet? 🔴`);
});
