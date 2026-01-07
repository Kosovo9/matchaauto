export class CoordinateTransformUtils {
    static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    static rad2deg(rad: number): number {
        return rad * (180 / Math.PI);
    }

    /**
     * Conviene coordenadas WGS84 a Web Mercator (EPSG:3857)
     */
    static toWebMercator(lat: number, lng: number) {
        const x = lng * 20037508.34 / 180;
        let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        y = y * 20037508.34 / 180;
        return { x, y };
    }
}
