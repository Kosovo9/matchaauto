'use client';

import { useState } from 'react';

export const usePayments = () => {
    const [loading, setLoading] = useState(false);

    const createStripeIntent = async (planId: string, userId: string, userEmail: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, userId, userEmail }),
            });
            return await response.json();
        } finally {
            setLoading(false);
        }
    };

    return { createStripeIntent, loading };
};
