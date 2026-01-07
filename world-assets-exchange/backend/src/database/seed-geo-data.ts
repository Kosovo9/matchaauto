import { Pool } from 'pg';
import { faker } from '@faker-js/faker';

const NUM_USERS = 1000;
const NUM_VEHICLES = 5000;
const NUM_GEOFENCES = 50;

// Major city coordinates for realistic distribution
const MAJOR_CITIES = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
];

const VEHICLE_TYPES = ['sedan', 'suv', 'truck', 'motorcycle', 'electric', 'hybrid', 'luxury', 'van'];
const VEHICLE_BRANDS = ['Tesla', 'Toyota', 'Ford', 'BMW', 'Mercedes', 'Honda', 'Hyundai', 'Nissan', 'Volkswagen', 'Porsche'];

export class GeoDataSeeder {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async seedAll(): Promise<void> {
        console.log('🌱 Starting spatial data seeding...');
        try {
            await this.seedUsers();
            await this.seedVehicles();
            await this.seedGeofences();
            console.log('✅ Spatial data seeding completed successfully!');
        } catch (error) {
            console.error('❌ Error seeding spatial data:', error);
            throw error;
        }
    }

    private async seedUsers(): Promise<void> {
        const client = await this.pool.connect();
        try {
            // Simulate user creation
            for (let i = 0; i < NUM_USERS; i++) {
                const userId = faker.string.uuid();
                const city = faker.helpers.arrayElement(MAJOR_CITIES);
                const lat = city.lat + (Math.random() - 0.5) * 0.1;
                const lng = city.lng + (Math.random() - 0.5) * 0.1;

                await client.query(`
          INSERT INTO user_locations (
            user_id, location, session_id, device_type, accuracy, is_online
          ) VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, $5, $6, $7)
          ON CONFLICT (user_id) DO NOTHING;
        `, [userId, lng, lat, `session_${faker.string.uuid()}`, 'mobile', 50, true]);
            }
        } finally {
            client.release();
        }
    }

    private async seedVehicles(): Promise<void> {
        const client = await this.pool.connect();
        try {
            for (let i = 0; i < NUM_VEHICLES; i++) {
                const city = faker.helpers.arrayElement(MAJOR_CITIES);
                const lat = city.lat + (Math.random() - 0.5) * 0.2;
                const lng = city.lng + (Math.random() - 0.5) * 0.2;

                await client.query(`
          INSERT INTO vehicle_locations (
            user_id, vehicle_id, location, battery_level, is_active, metadata
          ) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7);
        `, [
                    faker.string.uuid(),
                    faker.string.uuid(),
                    lng,
                    lat,
                    faker.number.int({ min: 10, max: 100 }),
                    true,
                    JSON.stringify({
                        type: faker.helpers.arrayElement(VEHICLE_TYPES),
                        brand: faker.helpers.arrayElement(VEHICLE_BRANDS),
                        price: faker.number.int({ min: 15000, max: 100000 })
                    })
                ]);
            }
        } finally {
            client.release();
        }
    }

    private async seedGeofences(): Promise<void> {
        const client = await this.pool.connect();
        try {
            for (const city of MAJOR_CITIES) {
                const radius = 2000;
                await client.query(`
          INSERT INTO geofences (name, center, radius, geometry)
          VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4, 
                  ST_Buffer(ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography, $4)::geography);
        `, [`Zone ${city.name}`, city.lng, city.lat, radius]);
            }
        } finally {
            client.release();
        }
    }
}
