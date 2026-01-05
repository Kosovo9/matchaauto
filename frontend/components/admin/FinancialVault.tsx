import { Wallet, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FinancialVaultProps {
    finances: any;
}

export default function FinancialVault({ finances }: FinancialVaultProps) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Wallet className="text-yellow-500" />
                Bóveda Financiera (MXN)
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Utilidad Bruta</p>
                    <p className="text-xl font-bold text-green-400">${(finances.grossProfit || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Donación Filantropía</p>
                    <p className="text-xl font-bold text-blue-400">${(finances.donations || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">Pagos Afiliados</p>
                    <p className="text-xl font-bold text-purple-400">${(finances.affiliates || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/30">
                    <p className="text-sm text-gray-400 mb-1">OpEx / Infra</p>
                    <p className="text-xl font-bold text-red-400">${(finances.operations || 0).toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-500 font-medium">Próxima Distribución</span>
                    <span className="text-white font-bold">{finances.nextDistribution || 'Pendiente'}</span>
                </div>
            </div>
        </div>
    );
}
