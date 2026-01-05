'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';

interface CheckoutProps {
    listingId: string;
    plan: 'featured' | 'premium' | 'agency';
    price: number;
}

export const PaymentCheckout: React.FC<CheckoutProps> = ({ listingId, plan, price }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Lógica de integración con Mercado Pago / Stripe
        setTimeout(() => {
            setIsProcessing(false);
            alert('Redirigiendo a pasarela de pago segura...');
        }, 1500);
    };

    const planDetails = {
        featured: { name: 'Destacado 10x', duration: '7 días', icon: Zap, color: 'text-orange-500' },
        premium: { name: 'Dominación Total', duration: '30 días', icon: ShieldCheck, color: 'text-nasa-blue' },
        agency: { name: 'Agencia Pro', duration: 'Ilimitado', icon: CreditCard, color: 'text-purple-500' },
    };

    const activePlan = planDetails[plan];

    return (
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-nasa-blue/10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Checkout Seguro</h2>
                <Badge variant="certified">SSL Encryption</Badge>
            </div>

            <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-white/5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-nasa-blue/10 rounded-xl">
                        <activePlan.icon className={activePlan.color} size={24} />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">{activePlan.name}</h3>
                        <p className="text-gray-400 text-sm">Duración: {activePlan.duration}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <span className="text-gray-400">Total a pagar:</span>
                    <span className="text-3xl font-bold text-white">{formatPrice(price)}</span>
                </div>
            </div>

            <div className="space-y-4">
                <Button
                    variant="nasa"
                    className="w-full h-14 text-lg font-bold group"
                    onClick={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            Pagar Ahora
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>
                <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
                    Transacción protegida por Sentinel X Payment Shield
                </p>
            </div>
        </div>
    );
};
