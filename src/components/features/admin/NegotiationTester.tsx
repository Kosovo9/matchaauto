'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Ghost, ShieldAlert, CheckCircle } from 'lucide-react';

export const NegotiationTester = () => {
    const [offer, setOffer] = useState('');
    const [askingPrice, setAskingPrice] = useState('10000');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testNegotiation = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/test/negotiate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer: Number(offer), askingPrice: Number(askingPrice) }),
            });
            const data = await response.json();
            setResult(data);
        } catch (err) {
            setResult({ success: false, message: 'Error de conexión con el búnker.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 border border-nasa-blue/30 p-8 rounded-3xl space-y-6 max-w-xl mx-auto shadow-2xl shadow-nasa-blue/5">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                <Ghost className="text-nasa-blue" size={24} />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Ghost Negotiator Test Lab</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Precio de Venta</label>
                    <Input
                        type="number"
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(e.target.value)}
                        className="bg-black/50"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold">Tu Oferta</label>
                    <Input
                        type="number"
                        value={offer}
                        onChange={(e) => setOffer(e.target.value)}
                        placeholder="Ejem: 5000"
                        className="bg-black/50"
                    />
                </div>
            </div>

            <Button
                variant="nasa"
                className="w-full h-12"
                onClick={testNegotiation}
                disabled={loading}
            >
                Lanzar Oferta al Sistema
            </Button>

            {result && (
                <div className={`p-4 rounded-xl border flex gap-3 animate-in fade-in slide-in-from-top-4 duration-500 ${result.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
                    }`}>
                    {result.success ? (
                        <CheckCircle className="text-green-500 shrink-0" size={20} />
                    ) : (
                        <ShieldAlert className="text-red-500 shrink-0" size={20} />
                    )}
                    <div className="text-sm">
                        <p className={`font-bold uppercase text-[10px] ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                            {result.status || 'ERROR'}
                        </p>
                        <p className="text-white mt-1 leading-relaxed">{result.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};
