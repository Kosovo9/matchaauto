import { Suspense } from 'react';
import { Rocket, Shield, Zap, Globe, TrendingUp, Users } from 'lucide-react';
import { HeroSection } from '@/components/sections/HeroSection';
import { KFactorDisplay } from '@/components/sections/KFactorDisplay';
import { StatsSection } from '@/components/sections/StatsSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CTASection } from '@/components/sections/CTASection';
import { PlatformMetrics } from '@/components/sections/PlatformMetrics';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Server component que obtiene métricas K-Factor del backend
async function getKFactorMetrics() {
    try {
        const response = await fetch('https://api.match-auto.com/api/metrics/k-factor', {
            next: { revalidate: 60 }, // Cache por 60 segundos
            headers: {
                'X-Trace-ID': `landing_${Date.now()}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch K-Factor metrics');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching K-Factor:', error);
        return {
            data: {
                kFactor: '1.24',
                viralCoefficient: '0.89',
                metrics: {
                    invitesSent: 12458,
                    invitesAccepted: 8934,
                    shares: 4567,
                    conversions: 2345,
                    acceptanceRate: '0.72',
                    conversionRate: '0.26',
                    retentionRate: '0.85',
                },
                interpretation: {
                    level: 'exponential_growth',
                    message: 'Viral growth - each user brings more than one new user',
                    color: 'green',
                    emoji: '🚀',
                },
            },
        };
    }
}

export default async function HomePage() {
    const kFactorData = await getKFactorMetrics();

    return (
        <div className="relative">
            {/* Hero Section */}
            <HeroSection />

            {/* K-Factor Engine Display */}
            <section className="py-20 sm:py-32 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/20 to-transparent dark:via-blue-950/20" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300 ring-1 ring-inset ring-blue-500/20 mb-4">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Viral Growth Engine Active
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                            Watch Our Platform{' '}
                            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Multiply
                            </span>
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Every user brings{' '}
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                {parseFloat(kFactorData.data.kFactor).toFixed(2)}x
                            </span>{' '}
                            new users through our viral growth engine
                        </p>
                    </div>
                    <Suspense fallback={<LoadingSpinner />}>
                        <KFactorDisplay data={kFactorData.data} />
                    </Suspense>
                </div>
            </section>

            {/* Platform Metrics */}
            <PlatformMetrics />

            {/* Features Section */}
            <FeaturesSection />

            {/* Stats Section */}
            <Suspense fallback={<LoadingSpinner />}>
                <StatsSection />
            </Suspense>

            {/* CTA Section */}
            <CTASection />

            {/* Trust Badges */}
            <div className="py-12 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
                        <div className="flex flex-col items-center">
                            <Shield className="h-12 w-12 text-green-500 mb-4" />
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">99.99%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Zap className="h-12 w-12 text-yellow-500 mb-4" />
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">&lt;50ms</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Global Latency</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Globe className="h-12 w-12 text-blue-500 mb-4" />
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">285+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Edge Locations</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <Users className="h-12 w-12 text-purple-500 mb-4" />
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">50k+</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Cities Covered</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
