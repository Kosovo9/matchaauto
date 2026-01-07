export class AutoLocalizer {
    static EXCHANGE_RATES: Record<string, number> = {
        'USD': 1.0,
        'MXN': 17.0,
        'BRL': 5.0,
        'CAD': 1.35,
        'EUR': 0.92
    };

    static TERM_MAP: Record<string, Record<string, string>> = {
        'es': {
            'Supercar': 'Súper Auto',
            'All-Wheel Drive': 'Tracción Integral',
            'Leather Seats': 'Asientos de Piel',
            'Sunroof': 'Quemacocos'
        },
        'pt': {
            'Supercar': 'Supercarro',
            'All-Wheel Drive': 'Tração Integral',
            'Leather Seats': 'Bancos de Couro',
            'Sunroof': 'Teto Solar'
        }
    };

    async localizeListing(listing: any, targetCountryCode: string) {
        const config = {
            'mx': { currency: 'MXN', lang: 'es' },
            'br': { currency: 'BRL', lang: 'pt' },
            'us': { currency: 'USD', lang: 'en' },
            'ca': { currency: 'CAD', lang: 'en' },
            'de': { currency: 'EUR', lang: 'de' }
        }[targetCountryCode.toLowerCase()] || { currency: 'USD', lang: 'en' };

        // 1. Currency Conversion
        const rate = AutoLocalizer.EXCHANGE_RATES[config.currency] || 1.0;
        const convertedPrice = listing.price * rate;

        // 2. Term Localization
        let localizedTitle = listing.title;
        const terms = AutoLocalizer.TERM_MAP[config.lang];
        if (terms) {
            Object.keys(terms).forEach(englishTerm => {
                localizedTitle = localizedTitle.replace(new RegExp(englishTerm, 'gi'), terms[englishTerm]);
            });
        }

        return {
            ...listing,
            price: convertedPrice,
            currency: config.currency,
            title: localizedTitle,
            locale: config.lang
        };
    }
}
