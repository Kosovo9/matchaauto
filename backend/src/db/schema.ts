import { text, integer, decimal, boolean, timestamp, pgTable } from 'drizzle-orm/pg-core';

// Nota: Aunque D1 es SQLite, Drizzle permite usar tipos similares. 
// Para D1 usaremos sqlite-core si es necesario, pero Deepseek sugirió un esquema genérico.
// Ajustando a SQLite core para D1 compatibilidad.
import { sqliteTable, text as stext, integer as sinteger, real as sreal } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
    id: stext('id').primaryKey(),
    email: stext('email').unique().notNull(),
    name: stext('name'),
    avatarUrl: stext('avatar_url'),
    createdAt: sinteger('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

export const listings = sqliteTable('listings', {
    id: stext('id').primaryKey(),
    userId: stext('user_id').notNull().references(() => users.id),
    title: stext('title').notNull(),
    description: stext('description'),
    make: stext('make').notNull(),
    model: stext('model').notNull(),
    year: sinteger('year').notNull(),
    price: sreal('price').notNull(),
    mileage: sinteger('mileage'),
    fuelType: stext('fuel_type'),
    transmission: stext('transmission'),
    images: stext('images'), // JSON string
    locationLat: sreal('location_lat'),
    locationLng: sreal('location_lng'),
    city: stext('city'),
    state: stext('state'),
    country: stext('country'),
    isActive: sinteger('is_active', { mode: 'boolean' }).default(true),
    isFeatured: sinteger('is_featured', { mode: 'boolean' }).default(false),
    createdAt: sinteger('created_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: sinteger('updated_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});
