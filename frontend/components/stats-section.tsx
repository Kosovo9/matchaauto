'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export default function StatsSection({ stats }: any) {
    // Use defaults if stats fails to load
    const data = stats || {
        totalListings: 24500,
        happyCustomers: 12000,
        escrowProtected: 10000000,
        countries: 150
    }

    return (
        <section className="py-20 bg-black border-y border-white/10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="md:w-1/3">
                        <h2 className="text-4xl font-bold mb-6">
                            Trusted by<br />
                            <span className="text-cyan-400">Thousands</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-8">
                            Our platform is built on trust, transparency, and technology.
                            See why we are the fastest growing auto parts marketplace.
                        </p>
                        <a href="/about" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-semibold group">
                            Learn more about us
                            <ArrowUpRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-2 gap-8">
                        <StatBox value={data.totalListings.toLocaleString()} label="Active Listings" />
                        <StatBox value={`$${(data.escrowProtected / 1000000).toFixed(1)}M+`} label="Secure Volume" />
                        <StatBox value={data.happyCustomers.toLocaleString()} label="Verified Users" />
                        <StatBox value={data.countries + "+"} label="Global Markets" />
                    </div>
                </div>
            </div>
        </section>
    )
}

function StatBox({ value, label }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-4xl font-bold text-white mb-2">{value}</div>
            <div className="text-gray-400">{label}</div>
        </div>
    )
}
