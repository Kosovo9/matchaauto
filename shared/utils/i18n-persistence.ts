// Safe imports for both Browser and Node.js
let getCookie: any = () => undefined;
let setCookie: any = () => undefined;

// Dynamic load or safe fallback
if (typeof window !== 'undefined') {
    // We are in the browser, cookies-next should be available in the frontend bundle
    import('cookies-next').then(m => {
        getCookie = m.getCookie;
        setCookie = m.setCookie;
    }).catch(() => {
        console.warn('cookies-next not found in browser');
    });
}

export const SUPPORTED_LANGUAGES = ['es', 'en', 'ru', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'vi', 'pl', 'nl', 'th', 'id', 'he', 'sv', 'no', 'da', 'fi', 'cs', 'el'];

/**
 * Motor de Persistencia 300%
 * Garantiza que el idioma SE MANTENGA en toda la red de sitios.
 */
export const getPersistentLang = (): string => {
    // 1. Intentar obtener de la Cookie (Persistencia entre recargas y sub-paths)
    const savedLang = getCookie('match_auto_lang');
    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang as string)) {
        return savedLang as string;
    }

    // 2. Detectar del navegador
    if (typeof window !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            setCookie('match_auto_lang', browserLang, { maxAge: 60 * 60 * 24 * 365, domain: '.match-autos.com' });
            return browserLang;
        }
    }

    return 'en'; // Default global
};

export const setPersistentLang = (lang: string) => {
    if (SUPPORTED_LANGUAGES.includes(lang)) {
        setCookie('match_auto_lang', lang, { maxAge: 60 * 60 * 24 * 365, domain: '.match-autos.com' });
        if (typeof window !== 'undefined') {
            window.location.reload(); // Forzar actualización de UI en toda la plataforma
        }
    }
};
