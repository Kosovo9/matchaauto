/**
 * 🔗 GENERADOR DE QR SOBERANO
 * Crea códigos QR dinámicos para el mundo real.
 */
export const generateListingQR = (listingId: string, domain: 'com' | 'ad' = 'com') => {
    const baseUrl = domain === 'com' ? 'https://match-autos.com/v/' : 'https://match-autos.ad/check/';
    const url = `${baseUrl}${listingId}`;

    // Usamos el API de Google Charts como Backup o una lib local como 'qrcode.react'
    return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(url)}`;
};
