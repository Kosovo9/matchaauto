export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-nasa-blue">
                    MATCH-AUTO v1.0
                </h1>
                <p className="mt-4 text-xl text-neutral-400">
                    Operación 1000x en progreso...
                </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder for Sentinel X Status */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Sentinel X</h2>
                    <p className="text-sm text-neutral-400">Estado: Monitoreo Activo</p>
                </div>

                {/* Placeholder for K-Factor Engine */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Viral Engine</h2>
                    <p className="text-sm text-neutral-400">K-Factor Actual: 1.0</p>
                </div>

                {/* Placeholder for Admin Panel */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <h2 className="text-lg font-semibold text-white">Realtime Metrics</h2>
                    <p className="text-sm text-neutral-400">Usuarios: Escaneando...</p>
                </div>
            </div>
        </main>
    );
}
