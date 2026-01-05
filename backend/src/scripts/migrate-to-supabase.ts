import { createClient } from '@supabase/supabase-js';

export async function migrateToSupabase(env: any) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const d1 = env.DB;

    console.log('🚀 Starting Zero-Downtime Migration to Supabase...');

    // 1. Fetch from D1
    const users = await d1.prepare('SELECT * FROM users').all();

    if (users.results && users.results.length > 0) {
        console.log(`📦 Migrating ${users.results.length} users...`);

        // 2. Upsert to Supabase
        const { error } = await supabase
            .from('users')
            .upsert(users.results, { onConflict: 'id' });

        if (error) {
            console.error('❌ Migration failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    console.log('✅ Migration completed successfully.');
    return { success: true };
}
