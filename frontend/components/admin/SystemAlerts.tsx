import { AlertCircle, ShieldAlert, Bell } from 'lucide-react';

interface SystemAlertsProps {
    alerts: any[];
}

export default function SystemAlerts({ alerts }: SystemAlertsProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6 h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="text-red-500" />
                Alertas Sentinel-X
            </h2>
            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-700 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Sin amenazas detectadas</p>
                    </div>
                ) : (
                    alerts.map((alert, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${alert.severity === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                            }`}>
                            <div className="flex items-start gap-3">
                                <ShieldAlert className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm uppercase">{alert.type || 'SISTEMA'}</p>
                                    <p className="text-sm opacity-90">{alert.message}</p>
                                    <p className="text-xs mt-1 opacity-50">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
