import { PublicKey } from '@solana/web3.js';

/**
 * Valida si una cadena es una llave pública de Solana válida (Base58, 32-44 chars).
 */
export const isValidSolanaPublicKey = (key: string | undefined): boolean => {
    if (!key) return false;
    try {
        new PublicKey(key);
        return true;
    } catch {
        return false;
    }
};

/**
 * Formatea una dirección acortándola para la UI.
 */
export const shortenAddress = (address: string, chars = 4): string => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
