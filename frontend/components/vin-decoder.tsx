'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { backend } from '../lib/backend-connection'
import { toast } from 'react-hot-toast'

export default function VINDecoder() {
    const [vin, setVin] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleDecode = async () => {
        if (!vin.trim()) {
            toast.error('Please enter a VIN')
            return
        }

        setLoading(true)
        try {
            const data = await backend.decodeVIN(vin)
            setResult(data)
            toast.success('VIN decoded successfully!')
        } catch (error) {
            console.error('Failed to decode VIN:', error)
            toast.error('Failed to decode VIN. Using demo data.')
            // Demo data for testing
            setResult({
                year: '2023',
                make: 'Toyota',
                model: 'Camry',
                engine: '2.5L 4-Cylinder',
                trim: 'LE',
                compatibilityKey: '2023-toyota-camry-2.5l-4-cylinder',
                success: true,
                compatibleParts: [
                    { name: 'Brake Pads Front', category: 'Brakes', price: 45.99 },
                    { name: 'Oil Filter', category: 'Engine', price: 12.50 },
                    { name: 'Air Filter', category: 'Engine', price: 18.75 },
                    { name: 'Spark Plugs (4)', category: 'Ignition', price: 32.00 }
                ]
            })
        } finally {
            setLoading(false)
        }
    }

    function InfoRow({ label, value }: { label: string; value: string }) {
        return (
            <div className="flex justify-between items-center py-3 border-b border-white/10 last:border-0">
                <span className="text-gray-400">{label}</span>
                <span className="font-semibold text-lg text-white">{value}</span>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Input */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <input
                        type="text"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        placeholder="Enter VIN (e.g., 1HGCM82633A004352)"
                        className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500 focus:outline-none text-lg text-white placeholder-gray-500 transition-colors"
                        maxLength={17}
                    />
                </div>
                <button
                    onClick={handleDecode}
                    disabled={loading}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2 text-white font-bold"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Decoding...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Decode VIN
                        </>
                    )}
                </button>
            </div>

            {/* Result */}
            {result && (
                <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-8 border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h3 className="text-2xl font-bold mb-6 text-center text-white">Decoded Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 bg-black/20 p-6 rounded-xl">
                            <InfoRow label="Year" value={result.year} />
                            <InfoRow label="Make" value={result.make} />
                            <InfoRow label="Model" value={result.model} />
                        </div>
                        <div className="space-y-2 bg-black/20 p-6 rounded-xl">
                            <InfoRow label="Engine" value={result.engine} />
                            <InfoRow label="Trim" value={result.trim} />
                            <InfoRow label="Compatibility Key" value={result.compatibilityKey} />
                        </div>
                    </div>

                    {result.compatibleParts && (
                        <div className="mt-8">
                            <h4 className="text-xl font-bold mb-4 text-cyan-400">Compatible Parts</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {result.compatibleParts.slice(0, 4).map((part: any, i: number) => (
                                    <div key={i} className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-cyan-500/30 transition-colors">
                                        <div className="font-semibold text-white">{part.name}</div>
                                        <div className="text-sm text-gray-400">{part.category}</div>
                                        <div className="text-cyan-400 font-bold mt-2">${part.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Demo VINs */}
            <div className="mt-8 text-center">
                <p className="text-gray-400 mb-2">Try these demo VINs:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {['1HGCM82633A004352', '5YJSA1CN7DFP12345', 'WBA5A5C58FDZ98765'].map((demoVin) => (
                        <button
                            key={demoVin}
                            onClick={() => setVin(demoVin)}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm text-gray-300 border border-white/5"
                        >
                            {demoVin}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
