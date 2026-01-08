
"use client";

import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapPin {
    id: string;
    lat: number;
    lng: number;
    price: number;
    currency: string;
    title: string;
}

interface MapProps {
    center: { lat: number; lng: number; zoom: number };
    items: MapPin[];
    onSelect?: (id: string) => void;
}

export default function MapLibreView({ center, items, onSelect }: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markers = useRef<{ [id: string]: maplibregl.Marker }>({});

    useEffect(() => {
        if (!mapContainer.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: "https://tiles.openfreemap.org/styles/dark", // Ultra-sleek dark style
            center: [center.lng, center.lat],
            zoom: center.zoom,
        });

        map.current.addControl(new maplibregl.NavigationControl(), "top-right");

        return () => {
            map.current?.remove();
        };
    }, []);

    // Update Center
    useEffect(() => {
        if (map.current) {
            map.current.flyTo({
                center: [center.lng, center.lat],
                zoom: center.zoom,
                essential: true,
            });
        }
    }, [center]);

    // Update Markers
    useEffect(() => {
        if (!map.current) return;

        // Clear old markers not in current items
        const currentIds = new Set(items.map((i) => i.id));
        Object.keys(markers.current).forEach((id) => {
            if (!currentIds.has(id)) {
                markers.current[id].remove();
                delete markers.current[id];
            }
        });

        // Add/Update markers
        items.forEach((item) => {
            if (markers.current[item.id]) {
                markers.current[item.id].setLngLat([item.lng, item.lat]);
            } else {
                const el = document.createElement("div");
                el.className = "quantum-marker";
                el.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-black shadow-xl transform transition-transform hover:scale-110 cursor-pointer">
              ${item.currency} $${(item.price / 1000).toFixed(0)}k
            </div>
            <div class="w-2 h-2 bg-amber-400 rounded-full border-2 border-black -mt-1 shadow-lg"></div>
          </div>
        `;
                el.addEventListener("click", () => onSelect?.(item.id));

                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat([item.lng, item.lat])
                    .addTo(map.current!);

                markers.current[item.id] = marker;
            }
        });
    }, [items]);

    return (
        <div className="relative w-full h-[70vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-3xl group">
            <div ref={mapContainer} className="w-full h-full" />

            {/* HUD Layer */}
            <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-4 transition-opacity duration-300 pointer-events-none">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="text-[10px] font-black tracking-widest text-white/70 uppercase">Global Data Feed Active</div>
            </div>

            <style jsx global>{`
        .quantum-marker {
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4));
        }
        .maplibregl-ctrl-attrib { display: none !important; }
      `}</style>
        </div>
    );
}
