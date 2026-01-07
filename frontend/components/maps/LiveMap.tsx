'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon issues in Leaflet with Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
import { cn } from '@/lib/utils';

// Custom Pulse Icon
const createPulseIcon = (color: string = 'blue') => {
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="marker-pin ${color}"></div><div class="pulse-ring ${color}"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });
};

interface Vehicle {
    id: string;
    lat: number;
    lng: number;
    status: 'moving' | 'idle' | 'stopped';
    speed: number;
    heading: number;
    type: string;
}

interface LiveMapProps {
    vehicles?: Vehicle[];
    children?: React.ReactNode;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function LiveMap({ vehicles = [], children }: LiveMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500">Initializing Satellite Uplink...</div>;

    // Default center (e.g. NYC) or first vehicle
    const center: [number, number] = vehicles.length > 0
        ? [vehicles[0].lat, vehicles[0].lng]
        : [40.7128, -74.0060];

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
            <style jsx global>{`
            .leaflet-container {
                background: #0f172a;
                font-family: 'Inter', sans-serif;
            }
            .marker-pin {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #3b82f6;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 10px #3b82f6;
                z-index: 2;
            }
            .pulse-ring {
                border-radius: 50%;
                height: 30px;
                width: 30px;
                position: absolute;
                top: 0;
                left: 0;
                background-color: rgba(59, 130, 246, 0.4);
                animation: pulsate 2s ease-out infinite;
                opacity: 0;
                z-index: 1;
            }
            @keyframes pulsate {
                0% { transform: scale(0.1, 0.1); opacity: 0.5; }
                50% { opacity: 1; }
                100% { transform: scale(1.2, 1.2); opacity: 0; }
            }
        `}</style>

            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                {/* Dark Matter Tiles for "NASA" look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Children for Layers (Editor etc) */}
                {children}

                {vehicles.map((vehicle) => (
                    <Marker
                        key={vehicle.id}
                        position={[vehicle.lat, vehicle.lng]}
                        icon={createPulseIcon(vehicle.status === 'moving' ? 'blue' : 'orange')}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 space-y-1 min-w-[150px]">
                                <h3 className="font-bold text-slate-900">{vehicle.id}</h3>
                                <div className="text-xs text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="font-medium capitalize">{vehicle.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Speed:</span>
                                        <span className="font-medium">{vehicle.speed} km/h</span>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay HUD Elements */}
            <div className="absolute top-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Active: {vehicles.filter(v => v.status === 'moving').length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Idle: {vehicles.filter(v => v.status !== 'moving').length}</span>
                </div>
            </div>
        </div>
    );
}
