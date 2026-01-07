/**
 * 🛰️ MOTOR DE RESILIENCIA OFFLINE (PWA Core)
 * Este script asegura que los 25 idiomas y los datos críticos 
 * vivan en el dispositivo aunque no haya señal.
 */

export const saveDictionaryOffline = (lang: string, dictionary: any) => {
    if (typeof window !== 'undefined') {
        // @ts-ignore
        localStorage.setItem(`lang_vault_${lang}`, JSON.stringify({
            data: dictionary,
            timestamp: Date.now(),
            version: '1000x-final'
        }));
    }
};

export const getOfflineDictionary = (lang: string) => {
    if (typeof window !== 'undefined') {
        // @ts-ignore
        const vault = localStorage.getItem(`lang_vault_${lang}`);
        return vault ? JSON.parse(vault).data : null;
    }
    return null;
};

/**
 * Listener de Sincronización Automática
 * Se activa en cuanto vuelve la señal.
 */
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.addEventListener('online', () => {
        console.log("🚀 Señal recuperada. Sincronizando anuncios en cola...");
        // Aquí disparamos el motor de Hybrid Sync que creamos antes
    });
}
