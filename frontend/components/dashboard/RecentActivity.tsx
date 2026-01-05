export function RecentActivity({ userId }: { userId: string }) {
    const activities = [
        { type: 'sale', label: 'Item Sold: Vintage Watch', date: '2h ago', amount: '+0.45 SOL' },
        { type: 'listing', label: 'New Listing Created', date: '5h ago', amount: '' },
        { type: 'referral', label: 'New Referral via Viral Link', date: '1d ago', amount: '+0.01 SOL' },
    ]

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold">Recent Activity</div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {activities.map((activity, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{activity.label}</div>
                            <div className="text-xs text-gray-500">{activity.date}</div>
                        </div>
                        <div className="text-sm font-bold text-green-600">{activity.amount}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
