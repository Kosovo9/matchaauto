import { createClient } from '@supabase/supabase-js';

export class PhilanthropyLedger {
    private supabase: any;
    private donationPercentage = 0.03;

    constructor(env: { SUPABASE_URL: string; SUPABASE_KEY: string }) {
        this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    }

    async recordDonation(grossProfit: number, description: string) {
        const amount = grossProfit * this.donationPercentage;
        const { data, error } = await this.supabase
            .from('philanthropy_transactions')
            .insert({
                type: 'donation',
                amount,
                description,
                metadata: { grossProfit, percentage: this.donationPercentage },
                timestamp: new Date().toISOString(),
                status: 'completed'
            });

        if (error) throw error;
        return { success: true, amount };
    }

    async getImpactReport() {
        const { data } = await this.supabase
            .from('philanthropy_monthly_reports')
            .select('*')
            .order('month', { ascending: false })
            .limit(1);

        return data?.[0] || { total_donations: 0, total_animals_helped: 0 };
    }
}
