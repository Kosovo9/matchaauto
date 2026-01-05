'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[200px]">
            <div className="relative">
                {/* Outer orbit */}
                <motion.div
                    className="absolute -inset-4 border-2 border-blue-500/30 rounded-full"
                    animate={{
                        rotate: 360,
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Middle orbit */}
                <motion.div
                    className="absolute -inset-2 border-2 border-purple-500/30 rounded-full"
                    animate={{
                        rotate: -360,
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />

                {/* Inner orbit with dots */}
                <div className="relative w-12 h-12">
                    <motion.div
                        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: 0.25,
                        }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: 0.5,
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: 0.75,
                        }}
                    />
                </div>

                {/* Center pulse */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            </div>
        </div>
    );
}
