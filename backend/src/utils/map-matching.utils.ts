export class MapMatchingUtils {
    /**
     * Snaps a point to the nearest segment in a list
     */
    static snapToRoad(point: { lat: number, lng: number }, segments: any[]) {
        let bestSegment = null;
        let minDistance = Infinity;

        for (const segment of segments) {
            const dist = this.pointToSegmentDistance(point, segment.start, segment.end);
            if (dist < minDistance) {
                minDistance = dist;
                bestSegment = segment;
            }
        }

        return bestSegment;
    }

    private static pointToSegmentDistance(p: any, v: any, w: any) {
        const l2 = Math.pow(v.lat - w.lat, 2) + Math.pow(v.lng - w.lng, 2);
        if (l2 === 0) return Math.sqrt(Math.pow(p.lat - v.lat, 2) + Math.pow(p.lng - v.lng, 2));

        let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2;
        t = Math.max(0, Math.min(1, t));

        return Math.sqrt(
            Math.pow(p.lat - (v.lat + t * (w.lat - v.lat)), 2) +
            Math.pow(p.lng - (v.lng + t * (w.lng - v.lng)), 2)
        );
    }
}
