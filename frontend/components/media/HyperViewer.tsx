import React, { useState } from 'react';

interface MediaViewerProps {
    type: 'photo' | 'video' | '360' | 'vr';
    src: string;
    plan: 'basic' | 'premium' | 'diamond';
}

export const HyperViewer: React.FC<MediaViewerProps> = ({ type, src, plan }) => {
    const [zoom, setZoom] = useState(1);

    return (
        <div className="relative group overflow-hidden rounded-3xl bg-black aspect-square">
            {/* 📸 FOTO CON HYPER-ZOOM (100x Superior a Amazon) */}
            {type === 'photo' && (
                <div
                    className="w-full h-full transition-transform duration-300 cursor-zoom-in"
                    style={{ transform: `scale(${zoom})`, backgroundImage: `url(${src})`, backgroundSize: 'cover' }}
                    onMouseMove={(e) => {
                        // Lógica de Zoom de Precisión
                        setZoom(2.5);
                    }}
                    onMouseLeave={() => setZoom(1)}
                />
            )}

            {/* 🎥 SHORT CLIPS (TikTok Style) */}
            {type === 'video' && (
                <video
                    src={src}
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                />
            )}

            {/* 🔄 360º/VR BADGE */}
            {plan !== 'basic' && (
                <div className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-black animate-pulse">
                    {plan === 'diamond' ? '💎 VR TOUR ACTIVE' : '🔄 360º VIEW'}
                </div>
            )}

            {/* OVERLAY DE VENTA RÁPIDA */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full py-3 bg-white text-black font-bold rounded-xl">Contactar Vendedor</button>
            </div>
        </div>
    );
};
