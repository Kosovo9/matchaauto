import { Shield, Zap, Globe, Cpu } from 'lucide-react'

export function FeaturesSection() {
    const features = [
        {
            title: 'Solana Powered',
            description: 'Lightning-fast payments with near-zero fees using SOL and USDC.',
            icon: <Zap className="h-6 w-6 text-blue-500" />,
        },
        {
            title: 'AI Moderation',
            description: 'NASA-grade content scanning keeps the marketplace safe and high-quality.',
            icon: <Shield className="h-6 w-6 text-indigo-500" />,
        },
        {
            title: 'Edge Native',
            description: 'Running on Cloudflare Workers for sub-50ms latency globally.',
            icon: <Globe className="h-6 w-6 text-purple-500" />,
        },
        {
            title: 'Neural Growth',
            description: 'Incentivized viral engine drives organic traffic to your listings.',
            icon: <Cpu className="h-6 w-6 text-pink-500" />,
        },
    ]

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold dark:text-white">Built for the Modern Web</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
