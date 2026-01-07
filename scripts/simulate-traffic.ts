
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:8787/api/v1/tracking/position';
const VEHICLE_COUNT = 10;
const UPDATE_INTERVAL_MS = 2000;
const CENTER_LAT = 40.7128; // NYC
const CENTER_LNG = -74.0060;

// Vehicle State Interface
interface Vehicle {
    id: string;
    lat: number;
    lng: number;
    heading: number;
    speed: number;
    type: string;
}

// Initialize Fleet
const vehicles: Vehicle[] = Array.from({ length: VEHICLE_COUNT }).map((_, i) => ({
    id: `V-SIM-${100 + i}`,
    lat: CENTER_LAT + (Math.random() - 0.5) * 0.05,
    lng: CENTER_LNG + (Math.random() - 0.5) * 0.05,
    heading: Math.floor(Math.random() * 360),
    speed: 30 + Math.floor(Math.random() * 30), // 30-60 km/h
    type: Math.random() > 0.5 ? 'truck' : 'van'
}));

console.log(`🚗 Starting Traffic Simulator for ${VEHICLE_COUNT} vehicles...`);
console.log(`🎯 Target: ${API_URL}`);

// Simulation Loop
setInterval(async () => {
    const promises = vehicles.map(async (v) => {
        // Move vehicle based on heading (simplified physics)
        const rad = (v.heading * Math.PI) / 180;
        const dist = (v.speed / 3600) * (UPDATE_INTERVAL_MS / 1000); // Distance in km

        // Approx degrees (1 deg lat ~ 111km)
        const dLat = (dist * Math.cos(rad)) / 111;
        const dLng = (dist * Math.sin(rad)) / (111 * Math.cos(v.lat * Math.PI / 180));

        // Update state
        v.lat += dLat;
        v.lng += dLng;

        // Randomly change heading slightly
        v.heading = (v.heading + (Math.random() - 0.5) * 20) % 360;

        // Payload
        const payload = {
            vehicleId: v.id,
            lat: v.lat,
            lng: v.lng,
            speed: v.speed,
            heading: v.heading,
            timestamp: new Date().toISOString(),
            status: 'moving',
            metadata: {
                simulation: true,
                fuel: 75
            }
        };

        try {
            await axios.post(API_URL, payload);
            process.stdout.write('.'); // Dot for success
        } catch (error) {
            // silent fail on connection refused to keep loop clean, just show X
            process.stdout.write('x');
        }
    });

    await Promise.all(promises);
    // process.stdout.write('\n'); // New line per batch
}, UPDATE_INTERVAL_MS);

// Handle exit
process.on('SIGINT', () => {
    console.log('\n🛑 Simulation stopped.');
    process.exit(0);
});
