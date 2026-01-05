import { Shield, AlertTriangle, Activity, Globe } from 'lucide-react';

interface ModuleStatusProps {
    modules: any[];
}

export default function ModuleStatus({ modules }: ModuleStatusProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="text-cyan-500" />
                Estado de Módulos
            </h2>
            <div className="space-y-4">
                {modules.map((module) => (
                    <div key={module.id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-200">{module.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${module.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                }`}>
                                {module.status}
                            </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {module.latency}ms</span>
                            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {module.health}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { Zap } from 'lucide-react';
