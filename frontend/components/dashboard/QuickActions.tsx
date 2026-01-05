import Link from 'next/link'
import { PlusCircle, Wallet, Settings, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function QuickActions({ userId }: { userId: string }) {
    const actions = [
        { label: 'New Listing', icon: <PlusCircle className="h-5 w-5" />, href: '/listings/create' },
        { label: 'Wallet', icon: <Wallet className="h-5 w-5" />, href: '/dashboard/wallet' },
        { label: 'Marketplace', icon: <LayoutGrid className="h-5 w-5" />, href: '/listings' },
        { label: 'Settings', icon: <Settings className="h-5 w-5" />, href: '/settings' },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {actions.map((action, i) => (
                <Link key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-500 transition-all">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        {action.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
                </Link>
            ))}
        </div>
    )
}
