export class ClusterUtils {
    /**
     * Agrupa puntos cercanos en clusters (Grid-based simple clustering)
     */
    static gridCluster(points: { lat: number, lng: number }[], gridSizeDegrees = 0.01) {
        const clusters: Record<string, { points: any[], centroid: { lat: number, lng: number } }> = {};

        for (const point of points) {
            const gridLat = Math.floor(point.lat / gridSizeDegrees);
            const gridLng = Math.floor(point.lng / gridSizeDegrees);
            const key = `${gridLat}:${gridLng}`;

            if (!clusters[key]) {
                clusters[key] = { points: [], centroid: { lat: 0, lng: 0 } };
            }
            clusters[key].points.push(point);
        }

        // Calculate centroids
        return Object.values(clusters).map(c => {
            const sumLat = c.points.reduce((acc, p) => acc + p.lat, 0);
            const sumLng = c.points.reduce((acc, p) => acc + p.lng, 0);
            c.centroid = {
                lat: sumLat / c.points.length,
                lng: sumLng / c.points.length
            };
            return c;
        });
    }
}
