"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Car, Tag, Wrench, CheckCircle, Package, DollarSign, Calendar, MapPin, FileText, Camera, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { backendClient } from '@/lib/backend-client';

// --- TIPOS ---
type UploadStep = 'CATEGORY' | 'DETAILS' | 'MEDIA' | 'REVIEW';
type ListingType = 'SALE' | 'RENT';

export default function QuantumUpload() {
    const [step, setStep] = useState<UploadStep>('CATEGORY');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ESTADO DEL FORMULARIO (Mega Objeto)
    const [formData, setFormData] = useState({
        listingType: 'SALE' as ListingType,
        category: 'VEHICLES', // VEHICLES | PARTS | SERVICES
        subcategory: 'SUV',
        title: 'Cadillac Suburban LTZ V8', // Pre-llenado Demo
        price: 850000,
        currency: 'MXN',
        make: 'Cadillac',
        model: 'Suburban',
        year: 2021,
        trim: 'LTZ',
        mileage: 117000,
        features: ['Piel Negra', 'Factura Original', 'Unico Dueño', 'Llantas Nuevas', 'Quemacocos', 'Pantallas Traseras'],
        description: 'Impecable Suburban LTZ, super equipada. 8 Cilindros, gasolina. Todo pagado. Lista para viajar.',
        images: [] as string[]
    });

    // --- HANDLERS ---
    const handleSubmit = async () => {
        setIsLoading(true);
        // Simular subida cuántica
        setTimeout(() => {
            setIsLoading(false);
            setSuccess(true);
            // Aquí iría la llamada real: await backendClient.post('/api/listings', formData);
        }, 2500);
    };

    const FeatureTag = ({ label }: { label: string }) => (
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-xs font-mono">
            <CheckCircle className="w-3 h-3" /> {label}
        </div>
    );

    // --- RENDERERS ---

    if (success) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[600px] text-center p-8">
                <div className="w-24 h-24 rounded-full bg-[#39FF14]/20 flex items-center justify-center mb-6 border border-[#39FF14] shadow-[0_0_50px_rgba(57,255,20,0.3)]">
                    <Zap className="w-12 h-12 text-[#39FF14]" />
                </div>
                <h2 className="text-4xl font-black text-white mb-2">¡LISTING PUBLICADO!</h2>
                <p className="text-gray-400 mb-8 max-w-md">
                    Tu <strong>{formData.make} {formData.model}</strong> ya es visible globalmente en Match-Autos.
                    <br />La AI está optimizando su posicionamiento.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.location.href = '/'} className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold transition-all">Ir al Inicio</button>
                    <button onClick={() => setSuccess(false)} className="px-8 py-3 rounded-xl bg-[#39FF14] text-black font-black hover:brightness-110 transition-all">Subir Otro</button>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="w-full max-w-5xl mx-auto bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative">
            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-[#39FF14] to-purple-500"
                    initial={{ width: "25%" }}
                    animate={{ width: step === 'CATEGORY' ? '25%' : step === 'DETAILS' ? '50%' : step === 'MEDIA' ? '75%' : '100%' }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] min-h-[700px]">

                {/* SIDEBAR NAVIGATION */}
                <div className="bg-[#111] p-8 border-r border-white/5 flex flex-col gap-6">
                    <div className="mb-4">
                        <h3 className="text-xs font-mono text-gray-500 mb-2 tracking-widest">MODO DE OPERACIÓN</h3>
                        <div className="flex bg-black/50 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setFormData({ ...formData, listingType: 'SALE' })}
                                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", formData.listingType === 'SALE' ? "bg-[#39FF14] text-black shadow-lg" : "text-gray-400 hover:text-white")}
                            >
                                VENTA
                            </button>
                            <button
                                onClick={() => setFormData({ ...formData, listingType: 'RENT' })}
                                className={cn("flex-1 py-2 text-xs font-bold rounded-lg transition-all", formData.listingType === 'RENT' ? "bg-[#00B3FF] text-black shadow-lg" : "text-gray-400 hover:text-white")}
                            >
                                RENTA
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-mono text-gray-500 mb-3 tracking-widest">CATEGORÍA</h3>
                        <div className="flex flex-col gap-2">
                            {[
                                { id: 'VEHICLES', label: 'Vehículos', icon: Car },
                                { id: 'PARTS', label: 'Refacciones', icon: Wrench },
                                { id: 'SERVICES', label: 'Servicios', icon: Tag },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFormData({ ...formData, category: cat.id as any })}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium text-left",
                                        formData.category === cat.id
                                            ? "bg-white/10 border-white/20 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                                            : "bg-transparent border-transparent text-gray-500 hover:bg-white/5"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-blue-300 mb-1">Protección Total</p>
                                <p className="text-[10px] text-blue-400/70 leading-relaxed">
                                    Tus transacciones están aseguradas. Verificamos compradores y vendedores.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN FORM AREA */}
                <div className="p-8 lg:p-12 relative overflow-y-auto max-h-[800px]">

                    {/* --- HEADER --- */}
                    <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-6">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                                {formData.listingType === 'SALE' ? 'Vender' : 'Rentar'} {formData.category === 'VEHICLES' ? 'Vehículo' : formData.category === 'PARTS' ? 'Refacción' : 'Servicio'}
                            </h1>
                            <p className="text-gray-400 text-sm">Completa los datos para activar el algoritmo de matching.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-mono text-[#39FF14] border border-[#39FF14]/30 px-3 py-1 rounded-full bg-[#39FF14]/5">
                                AI ASSISTANT ACTIVE
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">

                        {/* 1. MEDIA UPLOAD (THE HOOK) */}
                        <section>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-[#39FF14]" /> FOTOS DEL VEHÍCULO
                            </h3>
                            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer group">
                                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg border border-white/10">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm font-bold text-white mb-1">Arrastra tus fotos aquí o haz click</p>
                                <p className="text-xs text-gray-500">Soporta JPG, PNG. La AI detectará el modelo automáticamente.</p>
                            </div>
                            {/* MOCK PREVIEW FOR SUBURBAN */}
                            <div className="mt-4 grid grid-cols-4 gap-4">
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#39FF14]/50 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                                    <img src="https://images.unsplash.com/photo-1633502263884-6352934c9c48?auto=format&fit=crop&q=80" className="object-cover w-full h-full" />
                                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-md">PORTADA</div>
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-video rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                                ))}
                            </div>
                        </section>

                        {/* 2. CORE DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 ml-1">MARCA</label>
                                <input type="text" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none transition-colors" placeholder="Ej. Chevrolet" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 ml-1">MODELO</label>
                                <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none transition-colors" placeholder="Ej. Suburban" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 ml-1">AÑO</label>
                                <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500 ml-1">KILOMETRAJE</label>
                                <div className="relative">
                                    <input type="number" value={formData.mileage} onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) })} className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none transition-colors" />
                                    <span className="absolute right-4 top-3 text-xs text-gray-500 font-bold">KM</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. PRICING & SPECS */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-6">
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-blue-400" /> CARACTERÍSTICAS DESTACADAS
                                    </h3>
                                    <button className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1">+ AÑADIR</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.features.map((f, i) => (
                                        <FeatureTag key={i} label={f} />
                                    ))}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-gray-500 ml-1">PRECIO ({formData.listingType === 'RENT' ? 'POR DÍA' : 'TOTAL'})</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-3.5 w-4 h-4 text-[#39FF14]" />
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xl font-bold text-white focus:border-[#39FF14] focus:outline-none transition-colors shadow-inner"
                                        />
                                        <span className="absolute right-4 top-3.5 text-xs text-gray-500 font-mono">MXN</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-gray-500 ml-1">CONDICIÓN LEGAL</label>
                                    <select className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none appearance-none">
                                        <option>Factura Original</option>
                                        <option>Refacturado</option>
                                        <option>Importado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-gray-500 ml-1">DESCRIPCIÓN VENDEDOR</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-[#151515] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#39FF14] focus:outline-none min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-white/5 flex justify-end gap-4">
                        <button className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancelar</button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3 rounded-xl bg-[#39FF14] hover:bg-[#32e612] text-black font-black tracking-wide shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> PROCESANDO AI...</>
                            ) : (
                                <>PUBLICAR AHORA <CheckCircle className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
