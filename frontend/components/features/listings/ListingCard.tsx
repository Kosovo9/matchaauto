"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Camera, ShieldCheck, Zap, MapPin } from 'lucide-react';

interface ListingCardProps {
    title: string;
    price: string;
    image: string;
    location: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    specs: string[];
}

export const ListingCard: React.FC<ListingCardProps> = ({
    title, price, image, location, isVerified, isFeatured, specs
}) => {
    return (
        <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-2xl overflow-hidden"
        >
            <Card className="bg-black/80 backdrop-blur-xl border-none text-white rounded-[22px] overflow-hidden">
                <div className="relative h-64 overflow-hidden group">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                    {isFeatured && (
                        <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" /> FEATURED
                        </div>
                    )}

                    <div className="absolute bottom-4 left-4">
                        <h3 className="text-2xl font-black tracking-tight">{price}</h3>
                    </div>
                </div>

                <CardHeader className="pt-6 pb-2">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold leading-none">{title}</h2>
                        {isVerified && <ShieldCheck className="text-green-400 w-5 h-5" />}
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mt-2">
                        <MapPin className="w-3 h-3" /> {location}
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {specs.map((spec, i) => (
                            <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/5 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5">
                                {spec}
                            </Badge>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 border-t border-white/5 mx-6 flex justify-between items-center px-0">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <Camera className="w-3.5 h-3.5" /> 360° TOUR AVAILABLE
                    </div>
                    <button className="bg-white text-black px-6 py-2 rounded-xl text-sm font-black hover:bg-white/90 transition-all uppercase tracking-tighter">
                        View Match
                    </button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};
