import React, { useEffect, useState } from 'react';
import { getPersistentLang, SUPPORTED_LANGUAGES } from '../shared/utils/i18n-persistence';

export const LanguageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const currentLang = getPersistentLang();
        setLang(currentLang);
        document.documentElement.lang = currentLang;
        setIsLoaded(true);
    }, []);

    if (!isLoaded) return <div className="loading-overlay">1000x Loading...</div>;

    return (
        <div className={`lang-context-${lang}`}>
            {children}
        </div>
    );
};
