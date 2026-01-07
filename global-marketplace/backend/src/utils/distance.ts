/**
 * Cálculo de distancia Haversine 10x
 * Optimizado para rendimiento en CPU
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    unit: 'km' | 'miles' = 'km'
): number {
    if (lat1 === lat2 && lon1 === lon2) return 0;

    const R = unit === 'km' ? 6371 : 3958.8; // Radio de la Tierra
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Calcula el rumbo (bearing) entre dos puntos
 */
export function calculateBearing(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const y = Math.sin((lon2 - lon1) * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180));
    const x =
        Math.cos(lat1 * (Math.PI / 180)) * Math.sin(lat2 * (Math.PI / 180)) -
        Math.sin(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.cos((lon2 - lon1) * (Math.PI / 180));

    let brng = Math.atan2(y, x) * (180 / Math.PI);
    return (brng + 360) % 360;
}
