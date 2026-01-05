export function StatsSection() {
    const stats = [
        { label: 'Total Volume', value: '$1.2M+' },
        { label: 'Active Sellers', value: '45k+' },
        { label: 'Global Reaches', value: '180+' },
        { label: 'Avg Latency', value: '<50ms' },
    ]

    return (
        <section className="py-24 bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-2">{stat.value}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
