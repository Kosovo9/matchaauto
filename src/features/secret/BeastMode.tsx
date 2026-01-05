'use client';

import React, { useEffect, useState } from 'react';

export const useBeastMode = () => {
    const [isBeastMode, setIsBeastMode] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Trigger: Alt + Shift + B (Beast)
            if (e.altKey && e.shiftKey && e.key === 'B') {
                setIsBeastMode(prev => !prev);
                if (!isBeastMode) {
                    console.log('%c 🐉 BEAST MODE ACTIVATED ', 'background: #ff0000; color: #fff; font-size: 20px; font-weight: bold;');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isBeastMode]);

    return isBeastMode;
};

export const BeastModeOverlay = () => {
    const isActive = useBeastMode();
    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none border-[10px] border-nasa-red/30 animate-pulse">
            <div className="absolute top-4 right-20 bg-nasa-red text-white text-[10px] font-bold px-3 py-1 uppercase tracking-tighter">
                Beast Mode Enabled: Performance +200%
            </div>
        </div>
    );
};
