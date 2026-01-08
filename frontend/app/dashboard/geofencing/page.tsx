'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Shield, Bell, Zap, Save, Trash2, List } from 'lucide-react';
import { cn } from '../../../lib/utils';

const LiveMap = dynamic(() => import('../../../components/maps/LiveMap'), { ssr: false });
const GeofenceEditor = dynamic(() => import('../../../components/maps/GeofenceEditor'), { ssr: false });

export default function GeofencingPage() {
    const [draftGeofence, setDraftGeofence] = useState<any>(null);
    const [geofences, setGeofences] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'editor' | 'alerts'>('editor');

    const handleCreated = (geojson: any) => {
        setDraftGeofence(geojson);
    };

    const saveGeofence = () => {
        if (!draftGeofence) return;
        setGeofences([...geofences, { ...draftGeofence, id: Date.now(), name: `Zone ${geofences.length + 1}` }]);
        setDraftGeofence(null);
    };

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-7 h-7 text-blue-500" />
                        Geofence Command Center
                    </h2>
                    <p className="text-slate-400 text-sm">Define safety perimeters and real-time alert rules.</p>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex gap-6">
                {/* Left: Map Editor (70%) */}
                <div className="flex-[3] bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden">
                    <LiveMap vehicles={[]}>
                        <GeofenceEditor onGeofenceCreated={handleCreated} />
                    </LiveMap>

                    {/* Floating Map HUD */}
                    <div className="absolute top-4 left-4 z-[400] flex gap-2">
                        <div className="bg-slate-950/90 border border-blue-500/30 px-4 py-2 rounded-lg backdrop-blur shadow-2xl">
                            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">Editor Active</span>
                        </div>
                    </div>
                </div>

                {/* Right: Alert Engine & Properties (30%) */}
                <div className="flex-[1] bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="flex border-b border-slate-800">
                        <button
                            onClick={() => setActiveTab('editor')}
                            className={cn("flex-1 py-4 text-sm font-medium transition-colors", activeTab === 'editor' ? "text-blue-400 bg-slate-800/50" : "text-slate-500 hover:text-slate-300")}
                        >
                            Properties
                        </button>
                        <button
                            onClick={() => setActiveTab('alerts')}
                            className={cn("flex-1 py-4 text-sm font-medium transition-colors", activeTab === 'alerts' ? "text-blue-400 bg-slate-800/50" : "text-slate-500 hover:text-slate-300")}
                        >
                            Alert Engine
                        </button>
                    </div>

                    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                        {activeTab === 'editor' ? (
                            <>
                                {draftGeofence ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                            <h4 className="text-sm font-bold text-blue-400 mb-2">New Zone Detected</h4>
                                            <p className="text-xs text-slate-400">Geometry captured via Satellite Interface. Set properties to persist.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold">Zone Name</label>
                                            <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none" placeholder="e.g. Danger Zone Alpha" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs text-slate-500 uppercase font-bold">Priority</label>
                                            <select className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none">
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High (Critical)</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={saveGeofence}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-transform active:scale-95"
                                        >
                                            <Save className="w-4 h-4" /> Save Geofence
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20 opacity-50">
                                        <Zap className="w-12 h-12 text-slate-700" />
                                        <p className="text-sm text-slate-500">Pick a tool on the map to start building your perimeter.</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-300">Active Alert Rules</h4>
                                {[
                                    { title: 'Speed Limit Alert', rule: '> 80 km/h', icon: Zap, color: 'text-yellow-500' },
                                    { title: 'Unauthorized Entry', rule: 'Any Vehicle', icon: Shield, color: 'text-red-500' },
                                    { title: 'Late Exit', rule: 'After 10:00 PM', icon: Bell, color: 'text-orange-500' },
                                ].map((alert, i) => (
                                    <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg flex items-center gap-3">
                                        <alert.icon className={cn("w-5 h-5", alert.color)} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-white">{alert.title}</div>
                                            <div className="text-xs text-slate-500">{alert.rule}</div>
                                        </div>
                                        <Trash2 className="w-4 h-4 text-slate-600 hover:text-red-400 cursor-pointer transition-colors" />
                                    </div>
                                ))}
                                <button className="w-full py-2 border border-dashed border-slate-700 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all mt-4">
                                    + Add Custom Rule
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
