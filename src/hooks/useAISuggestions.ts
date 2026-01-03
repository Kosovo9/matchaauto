'use client';

import { useState } from 'react';

export const useAISuggestions = () => {
    const [loading, setLoading] = useState(false);

    const getPriceSuggestion = async (product: any) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/suggest-price`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            return await response.json();
        } finally {
            setLoading(false);
        }
    };

    return { getPriceSuggestion, loading };
};
