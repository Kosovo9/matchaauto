import { ViralDashboard } from '@/components/features/admin/ViralDashboard';
import { SecurityPanel } from '@/components/features/admin/SecurityPanel';
import { ImpactTracker } from '@/components/features/social/ImpactTracker';
import { AffiliateDashboard } from '@/components/features/admin/AffiliateDashboard';
import { NegotiationTester } from '@/components/features/admin/NegotiationTester';
import { ARVehicleInspector } from '@/features/05_experience/ar-vehicle-inspector';
import { PassiveIncomeDashboard } from '@/components/features/admin/PassiveIncomeDashboard';
import { EscrowDashboard } from '@/components/features/payments/EscrowDashboard';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center p-8 lg:p-24 space-y-12 bg-black overflow-x-hidden">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex border-b border-white/10 pb-8">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-nasa-blue bg-gradient-to-r from-nasa-blue to-nasa-red bg-clip-text text-transparent">
                    MATCH-AUTO 10x
                </h1>
                <div className="mt-4 lg:mt-0 flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-nasa-blue/10 rounded-full border border-nasa-blue/20">
                        <div className="w-2 h-2 bg-nasa-blue rounded-full animate-pulse" />
                        <span className="text-xs text-nasa-blue font-bold uppercase tracking-widest">Global Edge Active</span>
                    </div>
                    <p className="text-xl text-neutral-400 font-light italic">
                        "Driving the Future of Auto-Markets"
                    </p>
                </div>
            </div>

            <div className="w-full max-w-7xl space-y-12">
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-nasa-blue pl-4">Centro de Mando del Imperio</h2>
                    <PassiveIncomeDashboard />
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-nasa-red pl-4">Finanzas & Escrow</h2>
                        <EscrowDashboard />
                        <NegotiationTester />
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Misión & Viralidad</h2>
                        <ImpactTracker />
                        <AffiliateDashboard />
                        <ViralDashboard />
                    </section>
                </div>

                <section className="space-y-6">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-orange-500 pl-4">Seguridad Sentinel X</h2>
                    <SecurityPanel />
                </section>

                <div className="w-full pt-12">
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest border-l-4 border-purple-500 pl-4 mb-8">Experiencia Next-Gen</h2>
                    <div className="grid grid-cols-1 gap-12">
                        <ARVehicleInspector vehicle={{ make: 'Tesla', model: 'Model S' }} />
                    </div>
                </div>
            </div>

            <footer className="w-full max-w-5xl border-t border-white/10 pt-8 mt-12 text-center text-neutral-500 text-sm">
                <p>© 2026 Match-Auto Global Platforms. Nivel NASA 1000x Operacional. Optimizado para el Edge.</p>
            </footer>
        </main>
    );
}
