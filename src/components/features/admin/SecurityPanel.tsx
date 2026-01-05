'use client'

import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react'

export const SecurityPanel: React.FC = () => {
    const [threats, setThreats] = useState([
        { id: 1, type: 'Bot Detection', count: 142, severity: 'high' },
        { id: 2, type: 'Rate Limit', count: 89, severity: 'medium' },
        { id: 3, type: 'Header Analysis', count: 23, severity: 'low' },
    ])

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Shield className="text-green-500" size={24} />
                    <h2 className="text-2xl font-bold text-white">Sentinel X Security</h2>
                </div>
                <div className="px-3 py-1 bg-green-500/20 rounded-full">
                    <span className="text-green-500 text-sm font-semibold">PROTEGIDO</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Amenazas Bloqueadas</p>
                    <p className="text-3xl font-bold text-white">254</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Tasa de Detección</p>
                    <p className="text-3xl font-bold text-green-500">98.7%</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Tiempo Respuesta</p>
                    <p className="text-3xl font-bold text-white">12ms</p>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white mb-4">Amenazas Recientes</h3>
                {threats.map(threat => (
                    <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className={
                                threat.severity === 'high' ? 'text-red-500' :
                                    threat.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                            } size={20} />
                            <span className="text-white">{threat.type}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-300">{threat.count} eventos</span>
                            <button className="text-nasa-blue hover:text-blue-400 text-sm font-medium">
                                Investigar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
