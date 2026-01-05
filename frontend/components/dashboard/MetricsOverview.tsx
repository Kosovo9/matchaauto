export function MetricsOverview({ userId }: { userId: string }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <h4 className="font-bold mb-4">Engagement Rate</h4>
                <div className="text-2xl font-bold text-blue-600">4.8%</div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <h4 className="font-bold mb-4">Viral Reach</h4>
                <div className="text-2xl font-bold text-purple-600">2.4k users</div>
            </div>
        </div>
    )
}
