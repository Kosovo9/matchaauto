import React, { useEffect, useState } from 'react';

const disclaimers: Record<string, string> = {
    es: "AVISO LEGAL: Match-Autos 1000x es una plataforma de publicidad (Advertising). No cobramos comisión por venta. No garantizamos el éxito ni la finalidad de las transacciones. El servicio de custodia (Escrow) es exclusivo para inmuebles > 5M MXN y es responsabilidad total de los usuarios. No participamos en disputas ni mediaciones.",
    en: "LEGAL NOTICE: Match-Autos 1000x is an advertising platform. We do not charge sales commissions. We do not guarantee the completion or finality of transactions. Escrow services are exclusive to properties > 5M MXN and are the sole responsibility of the users. We do not participate in disputes or mediation.",
    ru: "ЮРИДИЧЕСКОЕ УВЕДОМЛЕНИЕ: Match-Autos 1000x — это рекламная платформа. Мы не взимаем комиссионные с продаж. Услуга условного депонирования предоставляется только для недвижимости стоимостью более 5 млн MXN. Мы не участвуем в спорах.",
};

export const GlobalFooter: React.FC = () => {
    const [lang, setLang] = useState('es');

    useEffect(() => {
        const userLang = navigator.language.split('-')[0];
        setLang(disclaimers[userLang] ? userLang : 'en');
    }, []);

    return (
        <footer className="bg-slate-900 text-white p-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-2">
                    <h3 className="text-xl font-bold mb-6 text-blue-500">Match-Autos 1000x | AD-NETWORK</h3>
                    <p className="text-xs text-slate-500 italic mb-4 leading-relaxed">
                        "{disclaimers[lang]}"
                    </p>
                    <div className="text-[10px] text-slate-600">
                        PLATAFORMA 97% ADS | CONEXIÓN DIRECTA | SEGURIDAD VIP ELITE
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest">Sedes Globales</h4>
                    <ul className="text-sm space-y-2 text-slate-500 font-mono">
                        <li><a href="https://match-autos.com" className="hover:text-blue-400">match-autos.com</a></li>
                        <li><a href="https://match-autos.ad" className="hover:text-amber-400">match-autos.ad</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-xs uppercase tracking-widest">Ingresos Ads</h4>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] bg-blue-900/30 px-2 py-1 rounded text-blue-300">Featured Ads</span>
                        <span className="text-[10px] bg-green-900/30 px-2 py-1 rounded text-green-300">Regional Blast</span>
                        <span className="text-[10px] bg-amber-900/30 px-2 py-1 rounded text-amber-300">VIP Escrow (5M+)</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-800 text-center text-[9px] text-slate-700 uppercase tracking-[0.3em]">
                © 2026 Match-Autos 1000x Group. La Red Inmobiliaria y de Consumo más rápida del mundo.
            </div>
        </footer>
    );
};
