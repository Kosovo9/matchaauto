import { DashboardSidebar } from '../../components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-950 relative">
                {/* Background Grid Effect */}
                <div className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                        opacity: 0.2
                    }}
                />

                <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
