import { getSupabase } from '../lib/supabase';

export const getAffiliateMargin = async (env: any, affiliateId: string) => {
    const supabase = getSupabase(env);
    const { data } = await supabase
        .from('affiliates')
        .select('commission_rate')
        .eq('id', affiliateId)
        .single();

    return data?.commission_rate || 10; // Default 10%
};

export const setAffiliateMargin = async (env: any, affiliateId: string, rate: number) => {
    const supabase = getSupabase(env);
    const { error } = await supabase
        .from('affiliates')
        .upsert({ id: affiliateId, commission_rate: rate });

    return !error;
};
