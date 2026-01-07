'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useActiveFleet } from '@/hooks/tracking/useVehicleTracking';
import { Activity, Radio, AlertTriangle } from 'lucide-react';

// Dynamically import map
const LiveMap = dynamic(() => import('@/components/maps/LiveMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-500 gap-4">
            <Radio className="w-12 h-12 animate-ping text-blue-500" />
            <span className="font-mono text-sm tracking-widest">ESTABLISHING UPLINK...</span>
        </div>
    )
});

export default function TrackingPage() {
    const { data: vehicles = [], isLoading, isError, error } = useActiveFleet(3000); // 3s poll

    // Calculate quick stats
    const activeCount = vehicles.filter(v => v.status === 'moving').length;
    const avgSpeed = vehicles.length > 0
        ? Math.round(vehicles.reduce((acc, v) => acc + (v.speed || 0), 0) / vehicles.length)
        : 0;

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header / Stats Bar */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Radio className={`w-6 h-6 ${isLoading ? 'text-yellow-500' : 'text-green-500'}`} />
                        Live Fleet Tracking
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {isLoading ? 'Synchronizing with satellites...' : `Monitoring ${vehicles.length} active units`}
                    </p>
                </div>

                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <div className="px-4 py-2 border-r border-slate-800">
                        <div className="text-xs text-slate-500 uppercase">Active</div>
                        <div className="text-xl font-bold text-blue-400">{activeCount}</div>
                    </div>
                    <div className="px-4 py-2 border-r border-slate-800">
                        <div className="text-xs text-slate-500 uppercase">Avg Speed</div>
                        <div className="text-xl font-bold text-emerald-400">{avgSpeed} <span className="text-xs text-slate-600">km/h</span></div>
                    </div>
                    <div className="px-4 py-2">
                        <div className="text-xs text-slate-500 uppercase">Alerts</div>
                        <div className="text-xl font-bold text-red-400">0</div>
                    </div>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-3 text-red-200">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Connection Lost: {(error as Error).message}</span>
                </div>
            )}

            {/* Map Container */}
            <div className="flex-1 min-h-0 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl overflow-hidden relative group">
                {/* HUD Overlay */}
                <div className="absolute top-4 left-4 z-[400] pointer-events-none">
                    <div className="bg-slate-950/80 backdrop-blur border border-green-500/20 px-3 py-1 rounded text-green-400 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        LIVE METRICS - {new Date().toLocaleTimeString()}
                    </div>
                </div>

                <LiveMap vehicles={vehicles} />

                {/* Empty State Overlay */}
                {!isLoading && vehicles.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[500]">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-slate-300">No Active Vehicles</h3>
                            <p className="text-slate-500">Fleet is currently dormant or offline.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
