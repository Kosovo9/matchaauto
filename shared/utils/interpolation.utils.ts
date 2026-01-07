export class InterpolationUtils {
    /**
     * Interpolar posición lineal entre dos timestamps
     */
    static interpolate(p1: any, p2: any, targetTime: number) {
        const fraction = (targetTime - p1.time) / (p2.time - p1.time);

        return {
            lat: p1.lat + (p2.lat - p1.lat) * fraction,
            lng: p1.lng + (p2.lng - p1.lng) * fraction,
            speed: p1.speed + (p2.speed - p1.speed) * fraction
        };
    }

    /**
     * Dead Reckoning (Estimación por velocidad y rumbo)
     */
    static estimatePosition(current: any, timeElapsedSec: number) {
        const R = 6371e3;
        const distance = current.speed * timeElapsedSec;
        const brng = current.bearing * Math.PI / 180;

        const lat1 = current.lat * Math.PI / 180;
        const lon1 = current.lng * Math.PI / 180;

        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance / R) +
            Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng));
        const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
            Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2));

        return {
            lat: lat2 * 180 / Math.PI,
            lng: lon2 * 180 / Math.PI
        };
    }
}
