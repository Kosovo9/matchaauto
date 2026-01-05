import React from 'react';
import {
    MapPin,
    Fuel,
    Gauge,
    Calendar,
    Settings,
    Star,
    Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export interface ListingCardProps {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    mileage?: number;
    fuelType?: string;
    transmission?: string;
    images: string[];
    city?: string;
    state?: string;
    isFeatured?: boolean;
    isCertified?: boolean;
    onClick?: (id: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
    id,
    title,
    make,
    model,
    year,
    price,
    mileage,
    fuelType,
    transmission,
    images,
    city,
    state,
    isFeatured = false,
    isCertified = false,
    onClick,
}) => {
    const mainImage = images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=2574';

    return (
        <div
            className="group relative bg-gray-900/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-800 hover:border-nasa-blue transition-all duration-300 hover:shadow-2xl hover:shadow-nasa-blue/20 cursor-pointer"
            onClick={() => onClick?.(id)}
        >
            {/* Badges */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                {isFeatured && (
                    <Badge variant="featured">
                        <Star size={14} className="mr-1" />
                        Destacado
                    </Badge>
                )}
                {isCertified && (
                    <Badge variant="certified">
                        <Shield size={14} className="mr-1" />
                        Certificado
                    </Badge>
                )}
            </div>

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={mainImage}
                    alt={`${make} ${model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-nasa-blue transition-colors">
                            {make} {model}
                        </h3>
                        <p className="text-gray-400 text-sm">{title}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                            {formatPrice(price)}
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-sm">{year}</span>
                    </div>
                    {mileage && (
                        <div className="flex items-center gap-2 text-gray-300">
                            <Gauge size={16} className="text-gray-500" />
                            <span className="text-sm">{mileage.toLocaleString()} km</span>
                        </div>
                    )}
                    {fuelType && (
                        <div className="flex items-center gap-2 text-gray-300">
                            <Fuel size={16} className="text-gray-500" />
                            <span className="text-sm capitalize">{fuelType}</span>
                        </div>
                    )}
                    {transmission && (
                        <div className="flex items-center gap-2 text-gray-300">
                            <Settings size={16} className="text-gray-500" />
                            <span className="text-sm capitalize">
                                {transmission === 'automatic' ? 'Automático' : 'Manual'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Location */}
                {city && state && (
                    <div className="flex items-center gap-2 text-gray-400 border-t border-gray-800 pt-4">
                        <MapPin size={16} />
                        <span className="text-sm">
                            {city}, {state}
                        </span>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    variant="primary"
                    className="w-full mt-4 group-hover:bg-nasa-blue group-hover:text-white"
                >
                    Ver Detalles
                </Button>
            </div>
        </div>
    );
};
