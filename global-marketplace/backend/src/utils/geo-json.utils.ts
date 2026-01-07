export class GeoJSONUtils {
    static toPoint(lng: number, lat: number, properties = {}) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            properties
        };
    }

    static toCollection(features: any[]) {
        return {
            type: 'FeatureCollection',
            features
        };
    }

    static wrapWithMetadata(data: any, metadata: any) {
        return {
            ...this.toCollection(data),
            metadata
        };
    }
}
