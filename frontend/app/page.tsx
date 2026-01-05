'use client'

import { useEffect, useState } from 'react'
import HeroSection from '@/components/hero-section'
import FeaturesGrid from '@/components/features-grid'
import VINDecoder from '@/components/vin-decoder'
import MarketplacePreview from '@/components/marketplace-preview'
import StatsSection from '@/components/stats-section'
import CTASection from '@/components/cta-section'
import { backend } from '@/lib/backend-connection'
import { toast } from 'react-hot-toast'

export default function Home() {
    const [globalStats, setGlobalStats] = useState(null)

    useEffect(() => {
        // Fetch global stats on load
        backend.getGlobalStats()
            .then(data => setGlobalStats(data))
            .catch(err => {
                console.error('Failed to load global stats:', err)
                // Fallback or demo data handled by components or useState init
            })
    }, [])

    return (
        <div className="min-h-screen">
            <HeroSection />

            {/* VIN Decoder Section - Functional */}
            <section id="vin-decoder" className="py-20 bg-gradient-to-b from-black to-gray-900 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            AI-Powered VIN Decoder
                        </span>
                    </h2>
                    <VINDecoder />
                </div>
            </section>

            {/* Marketplace Preview */}
            <section id="marketplace" className="py-20 bg-black">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Global Marketplace
                        </span>
                    </h2>
                    <MarketplacePreview />
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-gradient-to-b from-black to-gray-900">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
                        <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            Why Choose Match-Auto?
                        </span>
                    </h2>
                    <FeaturesGrid />
                </div>
            </section>

            {/* Stats Section */}
            <StatsSection stats={globalStats} />

            {/* CTA Section */}
            <CTASection />
        </div>
    )
}
