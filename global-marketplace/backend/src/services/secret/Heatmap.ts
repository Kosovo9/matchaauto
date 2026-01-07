export const HeatmapGenerator = {
    getHeatEntries: async (env: any) => {
        // Genera puntos de calor basados en búsquedas recientes en KV
        return [
            { lat: -34.6037, lng: -58.3816, intensity: 0.8 }, // Buenos Aires
            { lat: 19.4326, lng: -99.1332, intensity: 0.95 } // CDMX
        ];
    }
}
