// frontend/src/features/media/FImgZoom.tsx
'use client';

import { useState, useRef, MouseEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react';

interface MediaItem {
    src: string;
    type: 'image' | 'video';
    alt?: string;
}

export default function FImgZoom({ media }: { media: MediaItem[] }) {
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: MouseEvent) => {
        if (!isZoomed || !containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className="relative group overflow-hidden rounded-2xl bg-black border border-white/10 shadow-2xl">
            {/* Main Preview */}
            <div
                ref={containerRef}
                className="relative aspect-video overflow-hidden cursor-zoom-in"
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomed(!isZoomed)}
            >
                <motion.div
                    {...{
                        animate: {
                            scale: isZoomed ? 2.5 : 1,
                            x: isZoomed ? `${50 - mousePos.x}%` : 0,
                            y: isZoomed ? `${50 - mousePos.y}%` : 0,
                        },
                        transition: { type: 'spring', stiffness: 300, damping: 30 },
                        className: "w-full h-full"
                    } as any}
                >
                    <Image
                        src={media[selectedIdx].src}
                        alt={media[selectedIdx].alt || 'Product View'}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] uppercase tracking-widest text-white/80">
                            TRINITY_HD_OPTICS
                        </div>
                        <div className="px-3 py-1 bg-blue-500/20 backdrop-blur-md rounded-full border border-blue-500/30 text-[10px] uppercase tracking-widest text-blue-400">
                            {isZoomed ? 'ZOOM_ACTIVE 2.5X' : 'ZOOM_READY'}
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                        className="p-2 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 hover:bg-white/10 transition-colors pointer-events-auto"
                    >
                        {isZoomed ? <ZoomOut className="w-5 h-5 text-white" /> : <ZoomIn className="w-5 h-5 text-white" />}
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex p-4 space-x-3 overflow-x-auto scrollbar-hide">
                {media.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedIdx(i)}
                        className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedIdx === i ? 'border-blue-500 scale-105 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                    >
                        <Image src={item.src} alt="thumb" fill className="object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
