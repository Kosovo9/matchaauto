import { ArrowRight, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20 mb-8">
                    Next-Gen Marketplace is Live
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
                    The Global Marketplace for the{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Autonomous Age
                    </span>
                </h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10">
                    Edge-native marketplace with Solana payments, AI-driven moderation, and a unique viral growth engine that rewards early adopters.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/listings">
                        <Button size="lg" className="h-12 px-8 text-lg rounded-xl">
                            Explore Marketplace
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="/how-it-works">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-xl">
                            How it Works
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
