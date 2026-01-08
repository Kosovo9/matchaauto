import { IdentityPanel } from "@/components/profile/IdentityPanel";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Mission Control</h2>
                <p className="text-slate-400 mt-1">Global fleet status and operational metrics.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Metric Cards */}
                {[
                    { title: 'Total Fleet', value: '1,284', change: '+12%', color: 'blue' },
                    { title: 'Active Missions', value: '843', change: '+5%', color: 'green' },
                    { title: 'Alerts', value: '23', change: '-2%', color: 'red' },
                    { title: 'Efficiency', value: '94.2%', change: '+1.4%', color: 'purple' },
                ].map((metric) => (
                    <div key={metric.title} className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                        <div className="flex flex-row items-center justify-between pb-2">
                            <h3 className="tracking-tight text-sm font-medium text-slate-400">{metric.title}</h3>
                        </div>
                        <div className="text-2xl font-bold text-white">{metric.value}</div>
                        <p className="text-xs text-slate-500 mt-1">
                            <span className={`text-${metric.color}-400 font-medium`}>{metric.change}</span> from last month
                        </p>
                    </div>
                ))}
            </div>

            {/* IDENTITY VERIFICATION PANEL (P0) */}
            <div className="rounded-xl border border-white/10 p-6 bg-slate-900/50">
                <h3 className="text-lg font-medium text-white mb-4">Sovereign Identity</h3>
                <div className="max-w-md">
                    <IdentityPanel />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl bg-slate-900 border border-slate-800 p-6 min-h-[400px]">
                    <h3 className="text-lg font-medium text-white mb-4">Live Activity Heatmap</h3>
                    <div className="h-full flex items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-lg bg-slate-950/50">
                        Map Placeholder
                    </div>
                </div>
                <div className="col-span-3 rounded-xl bg-slate-900 border border-slate-800 p-6 min-h-[400px]">
                    <h3 className="text-lg font-medium text-white mb-4">Recent Alerts</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <div>
                                    <div className="text-sm font-medium text-white">Geofence Violation</div>
                                    <div className="text-xs text-slate-500">Vehicle V-10{i} • 2 mins ago</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
