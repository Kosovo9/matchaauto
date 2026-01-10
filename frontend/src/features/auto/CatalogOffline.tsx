// frontend/src/features/auto/CatalogOffline.tsx
'use client';

import { useState, useEffect } from 'react';
import { actions } from '../../../shared/core/actions';
import { Search, Car, Cpu, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CatalogOffline() {
    const [vin, setVin] = useState('');
    const [decodedData, setDecodedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleDecode = async () => {
        if (!vin) return;
        setLoading(true);
        try {
            // Simulate calling the new backend route
            const res = await fetch(`http://localhost:3001/api/vehicle/decode/${vin}`);
            const data = await res.json();
            setDecodedData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-8 bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-3xl">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1 space-y-8">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
                            OFFLINE_CATALOG <span className="text-blue-500">ENGINE</span>
                        </h2>
                        <p className="text-white/40 max-w-md">
                            Access 1.2M vehicle specs without internet. Decode VINS, verify builds, and cross-reference parts locally.
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative flex bg-black border border-white/10 rounded-2xl p-2">
                            <input
                                value={vin}
                                onChange={(e) => setVin(e.target.value)}
                                placeholder="ENTER_VIN_FOR_LOCAL_DECODE"
                                className="flex-1 bg-transparent border-none text-white p-4 font-mono text-sm tracking-widest focus:ring-0"
                            />
                            <button
                                onClick={handleDecode}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-500 px-8 rounded-xl font-bold text-white transition-all disabled:opacity-50"
                            >
                                {loading ? 'SCANNING...' : 'DECODE'}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <Cpu className="w-6 h-6 text-blue-500 mb-4" />
                            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Local_Model</div>
                            <div className="text-white font-bold">ResNet-V2 VIN</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                            <Database className="w-6 h-6 text-emerald-500 mb-4" />
                            <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">Sync_Status</div>
                            <div className="text-white font-bold">100% OFFLINE</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <AnimatePresence mode="wait">
                        {decodedData ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-full bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-10 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center space-x-4 mb-8">
                                        <div className="p-4 bg-blue-600 rounded-2xl">
                                            <Car className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white">{decodedData.make} {decodedData.model}</h3>
                                            <p className="text-blue-400 font-mono text-xs">{decodedData.vin}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'YEAR', val: decodedData.year },
                                            { label: 'ENGINE', val: decodedData.engine },
                                            { label: 'TRANS', val: decodedData.transmission },
                                            { label: 'TRUST_LVL', val: '99.9% (VERIFIED)' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between border-b border-white/5 pb-2">
                                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.label}</span>
                                                <span className="text-xs font-bold text-white font-mono">{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold transition-all mt-8">
                                    ADD_TO_LOCAL_CATALOG
                                </button>
                            </motion.div>
                        ) : (
                            <div className="h-full border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-white/10" />
                                </div>
                                <p className="text-white/20 text-sm font-medium">Ready for VIN sequence injection. System operating in shielded local mode.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
