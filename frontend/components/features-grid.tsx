'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Globe, Coins, Repeat, Lock } from 'lucide-react'

const FEATURES = [
    {
        icon: Globe,
        title: 'Global Reach',
        description: 'Access buyers and sellers in over 150 countries without worry about logistics or payments.',
        color: 'text-blue-400'
    },
    {
        icon: Shield,
        title: 'Secure Escrow',
        description: 'Your funds are held safely on the Solana blockchain until you confirm receipt of your parts.',
        color: 'text-purple-400'
    },
    {
        icon: Zap,
        title: 'AI VIN Decoding',
        description: 'Instantly find compatible parts with 100% accuracy using our advanced AI engine.',
        color: 'text-yellow-400'
    },
    {
        icon: Coins,
        title: 'Low Fees',
        description: 'Save up to 80% on transaction fees compared to traditional marketplaces.',
        color: 'text-green-400'
    },
    {
        icon: Repeat,
        title: 'Easy Returns',
        description: 'Our automated return process ensures fair handling for both buyers and sellers.',
        color: 'text-red-400'
    },
    {
        icon: Lock,
        title: 'Verified Sellers',
        description: 'Every seller undergoes strict verification to ensure a safe trading environment.',
        color: 'text-cyan-400'
    }
]

export default function FeaturesGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all duration-300"
                >
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 ${feature.color}`}>
                        <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                    </p>
                </motion.div>
            ))}
        </div>
    )
}
