'use client'

import React from 'react'
import { useViralMetrics } from '@/hooks/useViralMetrics'
import {
    Activity,
    TrendingUp,
    Users,
    Share2,
    Shield,
    AlertTriangle
} from 'lucide-react'

export const ViralDashboard: React.FC = () => {
    const { metrics, loading, status } = useViralMetrics()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nasa-blue"></div>
            </div>
        )
    }

    const statusConfig = {
        optimal: { color: 'text-green-500', bg: 'bg-green-500/10', icon: TrendingUp },
        critical: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', icon: AlertTriangle },
        decaying: { color: 'text-red-500', bg: 'bg-red-500/10', icon: Shield }
    }

    const StatusIcon = statusConfig[status]?.icon || Activity

    return (
        <div className="space-y-6">
            {/* Header del Dashboard */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Motor de Viralidad</h2>
                    <p className="text-gray-400">Métricas en tiempo real del crecimiento exponencial</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${statusConfig[status]?.bg || 'bg-gray-500/10'}`}>
                    <StatusIcon className={statusConfig[status]?.color || 'text-gray-500'} size={20} />
                    <span className={`font-semibold ${statusConfig[status]?.color || 'text-gray-500'}`}>
                        {status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* K-Factor Card */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">K-Factor</h3>
                        <Activity className="text-nasa-blue" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {metrics?.kFactor.toFixed(3) || '0.000'}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {metrics && metrics.kFactor > 1.0
                            ? 'Crecimiento exponencial activo'
                            : 'Requiere optimización'}
                    </p>
                </div>

                {/* Coeficiente Viral */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Coeficiente Viral</h3>
                        <TrendingUp className="text-green-500" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {metrics?.viralCoefficient.toFixed(1) || '0.0'}%
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        Porcentaje de crecimiento orgánico
                    </p>
                </div>

                {/* Predicción 30 días */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Proyección 30d</h3>
                        <Users className="text-purple-500" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {metrics?.prediction30d.toLocaleString() || '0'}
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        Nuevos usuarios esperados
                    </p>
                </div>

                {/* Tasa de Conversión */}
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Tasa de Conversión</h3>
                        <Share2 className="text-orange-500" size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {metrics ? (metrics.conversionRate * 100).toFixed(1) : '0.0'}%
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        De invitaciones a usuarios activos
                    </p>
                </div>
            </div>

            {/* Gráfico y Detalles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Tendencia de Crecimiento</h3>
                    {/* Aquí iría un gráfico Recharts en producción */}
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-800 rounded-lg">
                        <p className="text-gray-500">Gráfico de crecimiento viral (Recharts)</p>
                    </div>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Métricas Avanzadas</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-400">Tasa de Compartición</p>
                            <p className="text-xl font-semibold text-white">
                                {metrics ? (metrics.sharingRate * 100).toFixed(1) : '0.0'}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Tiempo de Ciclo</p>
                            <p className="text-xl font-semibold text-white">
                                {metrics ? (metrics.cycleTime / 1000 / 60).toFixed(0) : '0'} min
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Última Actualización</p>
                            <p className="text-sm text-white">
                                {metrics ? new Date(metrics.updatedAt).toLocaleTimeString() : '--:--:--'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
