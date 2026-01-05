import { TrendingUp, Users, Car, DollarSign, Target, Zap } from 'lucide-react';

interface LaunchMetricsProps {
    metrics: any;
}

export default function LaunchMetrics({ metrics }: LaunchMetricsProps) {
    const stats = [
        {
            label: 'Usuarios Activos',
            value: metrics?.users?.active || 0,
            change: metrics?.users?.change || 0,
            icon: <Users className="h-6 w-6" />,
            color: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Listings Activos',
            value: metrics?.listings?.active || 0,
            change: metrics?.listings?.change || 0,
            icon: <Car className="h-6 w-6" />,
            color: 'from-green-500 to-emerald-500'
        },
        {
            label: 'Transacciones Hoy',
            value: metrics?.transactions?.today || 0,
            change: metrics?.transactions?.change || 0,
            icon: <DollarSign className="h-6 w-6" />,
            color: 'from-yellow-500 to-amber-500'
        },
        {
            label: 'Match-Ads Activos',
            value: metrics?.ads?.active || 0,
            change: metrics?.ads?.change || 0,
            icon: <Target className="h-6 w-6" />,
            color: 'from-purple-500 to-pink-500'
        },
        {
            label: 'Subastas en Vivo',
            value: metrics?.auctions?.live || 0,
            change: metrics?.auctions?.change || 0,
            icon: <Zap className="h-6 w-6" />,
            color: 'from-red-500 to-orange-500'
        },
        {
            label: 'Tasa Conversión',
            value: `${metrics?.conversion?.rate || 0}%`,
            change: metrics?.conversion?.change || 0,
            icon: <TrendingUp className="h-6 w-6" />,
            color: 'from-indigo-500 to-violet-500'
        }
    ];

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">📊 Métricas de Lanzamiento México</h2>
                <div className="text-sm text-gray-400">
                    Actualizado: {new Date(metrics?.timestamp || Date.now()).toLocaleTimeString('es-MX')}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-gray-900/70 rounded-xl p-4 hover:bg-gray-900/90 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <div className={`text-sm font-semibold ${stat.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.change >= 0 ? '+' : ''}{stat.change}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold mb-1">{stat.value.toLocaleString('es-MX')}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <div className="text-sm font-medium mb-3">📈 Crecimiento de Usuarios (Últimas 24h)</div>
                <div className="h-32 bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-end h-full space-x-1">
                        {metrics?.growthChart?.map((value: number, index: number) => (
                            <div key={index} className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t" style={{ height: `${value}%` }} title={`Hora ${index}: ${value}%`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
