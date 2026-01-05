import { ViralDashboard } from '@/components/features/admin/ViralDashboard';
import { SecurityPanel } from '@/components/features/admin/SecurityPanel';
import { ImpactTracker } from '@/components/features/social/ImpactTracker';
import { AffiliateDashboard } from '@/components/features/admin/AffiliateDashboard';
import { NegotiationTester } from '@/components/features/admin/NegotiationTester';
import { ARVehicleInspector } from '@/features/05_experience/ar-vehicle-inspector';
import { PassiveIncomeDashboard } from '@/components/features/admin/PassiveIncomeDashboard';
import { EscrowDashboard } from '@/components/features/payments/EscrowDashboard';
import { CryptoEmpireWallet } from '@/components/features/payments/CryptoEmpireWallet';
import { EmpireInsurance } from '@/components/features/payments/EmpireInsurance';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-8 lg:p-24 space-y-12 bg-black overflow-x-hidden theme-empire">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border-b border-white/10 pb-8">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-nasa-blue bg-gradient-to-r from-nasa-blue to-empire-gold bg-clip-text text-transparent italic">
                    MATCH-AUTO SUPREMACY
                </h1>
                <div className="mt-4 lg:mt-0 flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-empire-gold/10 rounded-full border border-empire-gold/20">
                        <div className="w-2 h-2 bg-empire-gold rounded-full animate-pulse" />
                        <span className="text-xs text-empire-gold font-bold uppercase tracking-widest">Global Intelligence v2</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-7xl space-y-12">
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-nasa-blue pl-4">Centro de Mando del Imperio</h2>
                    <PassiveIncomeDashboard />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-nasa-red pl-4">Finanzas & Bóveda Web3</h2>
                        <EscrowDashboard />
                        <CryptoEmpireWallet />
                        <EmpireInsurance />
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Inteligencia & Mercado</h2>
                        <NegotiationTester />
                        <ImpactTracker />
                        <AffiliateDashboard />
                        <ViralDashboard />
                    </section>
                </div>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-orange-500 pl-4">Seguridad Sentinel X & IRP</h2>
                    <SecurityPanel />
                </section>

                <div className="w-full pt-12">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-purple-500 pl-4 mb-8">Ecosistema NFT & AR</h2>
                    <div className="grid grid-cols-1 gap-12">
                        <ARVehicleInspector vehicle={{ make: 'Porsche', model: '911 Turbo' }} />
                    </div>
                </div>
            </div>

            <footer className="w-full max-w-7xl border-t border-white/10 pt-12 mt-24 text-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500">
                    <div>Proxy Rotativo: ACTIVO</div>
                    <div>IPFS Backup: OPERACIONAL</div>
                    <div>On-Chain Rep: 4.8★</div>
                    <div>B2B API: v2.0</div>
                </div>
                <p className="text-neutral-500 text-sm">© 2026 Match-Auto Global Platforms. Nivel NASA 1000x Operacional. Valoración Proyectada: $1.5M - $300M.</p>
            </footer>
        </main>
    );
}
