import { Context } from 'hono';

export const REGIONAL_CONFIG: Record<string, any> = {
    'mx': { currency: 'MXN', language: 'es', launchDay: 1, timezone: 'America/Mexico_City' },
    'us': { currency: 'USD', language: 'en', launchDay: 4, timezone: 'America/New_York' },
    'ca': { currency: 'CAD', language: 'en', launchDay: 4, timezone: 'America/Toronto' },
    'br': { currency: 'BRL', language: 'pt', launchDay: 5, timezone: 'America/Sao_Paulo' },
    'default': { currency: 'USD', language: 'en', launchDay: 14, timezone: 'UTC' }
};

export const getRegionalConfig = (c: Context) => {
    const country = (c.req.raw as any).cf?.country?.toLowerCase() || 'default';
    return REGIONAL_CONFIG[country] || REGIONAL_CONFIG['default'];
};
