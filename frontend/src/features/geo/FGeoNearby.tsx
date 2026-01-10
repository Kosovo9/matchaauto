// frontend/src/features/geo/FGeoNearby.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { actions } from '../../../shared/core/actions';
import { Locate, Search, Navigation } from 'lucide-react';

export default function FGeoNearby({ initialLat = 19.4326, initialLng = -99.1332 }) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;

        mapRef.current = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
            center: [initialLng, initialLat],
            zoom: 12,
            attributionControl: false
        });

        mapRef.current.on('load', () => {
            fetchNearby(initialLat, initialLng);
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    const fetchNearby = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const data = await actions.geo.getNearbyObjects(lat, lng, 15);
            setListings(data);

            // Clear markers (simplified for brevity)
            // data.forEach(item => { ... })
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-3xl bg-neutral-950">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Control Panel */}
            <div className="absolute top-6 left-6 w-80 space-y-4">
                <div className="bg-black/80 backdrop-blur-2xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold tracking-[0.2em] text-white uppercase">Neural_Map_v4</h3>
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="SCAN_RADIUS / TARGET"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                        />
                        <Search className="absolute right-4 top-3 w-4 h-4 text-white/30" />
                    </div>
                </div>

                {/* Results Stream */}
                <div className="max-h-[300px] overflow-y-auto space-y-2 scrollbar-hide">
                    {listings.map((item, idx) => (
                        <div key={idx} className="bg-black/60 backdrop-blur-xl p-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                    <p className="text-[10px] text-white/40 font-mono mt-1">{item.distance_km.toFixed(2)} KM_DIST</p>
                                </div>
                                <Navigation className="w-3 h-3 text-white/20 group-hover:text-blue-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating HUD Elements */}
            <div className="absolute bottom-6 right-6">
                <button className="p-4 bg-blue-600 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:scale-110 active:scale-95 transition-all">
                    <Locate className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
}
