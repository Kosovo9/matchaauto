'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, ArrowRight, Tag, Star } from 'lucide-react'
import Link from 'next/link'

const FEATURED_LISTINGS = [
    {
        id: 1,
        title: 'Brembo Brake Kit - Model S',
        price: 1299.00,
        image: 'https://images.unsplash.com/photo-1597926189569-8088040d90d7?auto=format&fit=crop&q=80',
        condition: 'New',
        seller: 'TeslaParts_Official'
    },
    {
        id: 2,
        title: 'BMW M3 Carbon Fiber Hood',
        price: 850.00,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80',
        condition: 'Used - Like New',
        seller: 'EuroTuner'
    },
    {
        id: 3,
        title: 'Porsche 911 GT3 Wing',
        price: 3400.00,
        image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80',
        condition: 'Refurbished',
        seller: 'SupercarSalvage'
    },
    {
        id: 4,
        title: 'Audi R8 Headlights (Pair)',
        price: 2100.00,
        image: 'https://images.unsplash.com/photo-1618587154245-5d972740702d?auto=format&fit=crop&q=80',
        condition: 'New',
        seller: 'AudiOEM',
    }
]

export default function MarketplacePreview() {
    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {FEATURED_LISTINGS.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative rounded-2xl overflow-hidden bg-gray-900 border border-white/10 hover:border-cyan-500/50 transition-all duration-300"
                    >
                        <div className="aspect-[4/3] overflow-hidden bg-gray-800 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white border border-white/10">
                                {item.condition}
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">
                                    {item.title}
                                </h3>
                            </div>

                            <div className="flex items-center text-sm text-gray-400 mb-4">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.seller}
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-white">
                                    ${item.price.toLocaleString()}
                                </span>
                                <button className="p-2 rounded-lg bg-white/10 hover:bg-cyan-500 hover:text-black transition-all">
                                    <ShoppingBag className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="text-center">
                <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 font-semibold hover:opacity-90 transition-all"
                >
                    View All Listings
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    )
}
