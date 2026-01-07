import React, { useState } from 'react';

export const GrowthUpsellModal: React.FC<{ listingId: string }> = ({ listingId }) => {
    const [step, setStep] = useState<'offer' | 'upload'>('offer');

    const shareViaWhatsApp = () => {
        const text = `¡Mira lo que publiqué en Match-Autos! 🚀 Busca mi anuncio aquí: https://match-autos.com/listing/${listingId}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setStep('upload');
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-blue-500 rounded-2xl p-8 max-w-md text-center">
                {step === 'offer' ? (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">🚀 ¡Anuncio Publicado!</h2>
                        <p className="text-slate-400 mb-6">¿Quieres vender más rápido? Pon tu anuncio en los primeros lugares.</p>

                        <button className="w-full py-4 bg-amber-500 text-black font-black rounded-lg mb-4 hover:scale-105 transition">
                            SER #1 POR $99 MXN
                        </button>

                        <button
                            onClick={shareViaWhatsApp}
                            className="w-full py-4 border border-green-500 text-green-500 font-bold rounded-lg hover:bg-green-900/20"
                        >
                            🚀 OBTÉN 2 DÍAS GRATIS COMPARTIENDO
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-white mb-4">📷 Sube la Prueba</h2>
                        <p className="text-sm text-slate-400 mb-6">Toma una captura de pantalla de tus grupos compartidos y súbela aquí para activar tu premio.</p>
                        <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-600 file:text-white mb-4" />
                        <button className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold">Verificar con IA</button>
                    </>
                )}
            </div>
        </div>
    );
};
