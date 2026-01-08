import React, { useState } from 'react';
import { VoiceAIEngine } from '../../shared/utils/voice-processor';
import { getPersistentLang } from '../../shared/utils/i18n-persistence';

export const VoiceAdCreator: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'parsing'>('idle');
    const [result, setResult] = useState('');

    const handleVoice = async () => {
        const lang = getPersistentLang();
        const engine = new VoiceAIEngine(lang);

        try {
            setStatus('listening');
            const text = await engine.listen();
            setResult(text);
            setStatus('parsing');

            // Enviar a la IA para generar el anuncio
            const adData = await engine.parseToAd(text, 'general');
            console.log("Anuncio generado:", adData);
            setStatus('idle');
        } catch (err) {
            console.error(err);
            setStatus('idle');
        }
    };

    return (
        <div className="voice-control bg-slate-800 p-4 rounded-xl border border-blue-500/30">
            <button
                onClick={handleVoice}
                className={`w-full py-3 rounded-lg font-bold transition-all ${status === 'listening' ? 'bg-red-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-50'}`}
            >
                {status === 'listening' ? '🛑 Escuchando...' : '🎙️ Dictar mi Anuncio (Voz)'}
            </button>
            {result && <p className="mt-4 text-xs text-slate-400">Transcripción: "{result}"</p>}
        </div>
    );
};
