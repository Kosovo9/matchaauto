import { Suspense } from 'react';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BalanceDisplay } from '@/components/dashboard/BalanceDisplay';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { ListingStats } from '@/components/dashboard/ListingStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserNav } from '@/components/dashboard/UserNav';
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner';

async function getUserData(userId: string) {
    try {
        const response = await fetch(`https://api.match-auto.com/api/users/${userId}/dashboard`, {
            next: { revalidate: 30 },
            headers: {
                'X-Trace-ID': `dashboard_${Date.now()}_${userId}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

export default async function DashboardPage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const userData = await getUserData(user.id);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
            {/* Dashboard Header */}
            <div className="border-b border-gray-200 dark:border-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Dashboard
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Welcome back, {user.firstName || user.username}!
                            </p>
                        </div>
                        <UserNav user={user} />
                    </div>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Banner */}
                <WelcomeBanner user={user} />

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Balance
                                    </p>
                                    <Suspense fallback={<div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />}>
                                        <BalanceDisplay userId={user.id} />
                                    </Suspense>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-500/20">
                                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Active Listings
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {userData?.data?.stats?.activeListings || 0}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-500/20">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Total Sales
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ${userData?.data?.stats?.totalSales?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-500/20">
                                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Trust Score
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {userData?.data?.stats?.trustScore || 85}/100
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-500/20">
                                    <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <QuickActions userId={user.id} />

                        {/* Listing Stats */}
                        <Suspense fallback={<LoadingSpinner />}>
                            <ListingStats userId={user.id} />
                        </Suspense>

                        {/* Metrics Overview */}
                        <MetricsOverview userId={user.id} />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Recent Activity */}
                        <Suspense fallback={<LoadingSpinner />}>
                            <RecentActivity userId={user.id} />
                        </Suspense>

                        {/* Wallet Card */}
                        <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
                            <CardContent className="p-6">
                                <CardTitle className="text-white mb-4">Solana Wallet</CardTitle>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Network</span>
                                        <span className="text-green-400 font-mono">Mainnet</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-400">Status</span>
                                        <span className="text-green-400">Connected</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-800">
                                        <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                                            Manage Wallet
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Trust Score Card */}
                        <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-800/30">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <CardTitle className="text-gray-900 dark:text-white">
                                        Trust Score
                                    </CardTitle>
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {userData?.data?.stats?.trustScore || 85}
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                        style={{ width: `${userData?.data?.stats?.trustScore || 85}%` }}
                                    />
                                </div>
                                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                    Your trust score affects listing visibility and transaction limits.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
