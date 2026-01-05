'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useSpeedster = () => {
    const router = useRouter();

    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case 'h': router.push('/'); break;
                case 's': router.push('/search'); break;
                case 'c': router.push('/chat'); break;
                case 'a': router.push('/admin'); break;
                case '/': e.preventDefault(); (document.querySelector('input[type="search"]') as HTMLElement)?.focus(); break;
            }
        };

        window.addEventListener('keydown', handleKeys);
        return () => window.removeEventListener('keydown', handleKeys);
    }, [router]);
};
