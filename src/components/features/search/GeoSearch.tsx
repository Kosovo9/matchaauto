'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LocationSuggestion {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: 'city' | 'state' | 'country';
}

interface GeoSearchProps {
    onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
    radius?: number;
    onRadiusChange?: (radius: number) => void;
    showFilters?: boolean;
    onFiltersToggle?: () => void;
}

export const GeoSearch: React.FC<GeoSearchProps> = ({
    onLocationSelect,
    radius = 50,
    onRadiusChange,
    showFilters = false,
    onFiltersToggle,
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);

            setTimeout(() => {
                const mockSuggestions: LocationSuggestion[] = [
                    { id: '1', name: 'Madrid, España', lat: 40.4168, lng: -3.7038, type: 'city' },
                    { id: '2', name: 'Barcelona, España', lat: 41.3851, lng: 2.1734, type: 'city' },
                    { id: '3', name: 'Valencia, España', lat: 39.4699, lng: -0.3763, type: 'city' },
                    { id: '4', name: 'Andalucía, España', lat: 37.5443, lng: -4.7278, type: 'state' },
                    { id: '5', name: 'Cataluña, España', lat: 41.5912, lng: 1.5209, type: 'state' },
                ].filter(loc =>
                    loc.name.toLowerCase().includes(query.toLowerCase())
                );

                setSuggestions(mockSuggestions);
                setIsLoading(false);
            }, 300);
        };

        fetchSuggestions();
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLocationSelect = (suggestion: LocationSuggestion) => {
        setSelectedLocation(suggestion);
        setQuery(suggestion.name);
        setSuggestions([]);
        onLocationSelect({
            lat: suggestion.lat,
            lng: suggestion.lng,
            name: suggestion.name,
        });
    };

    const clearLocation = () => {
        setSelectedLocation(null);
        setQuery('');
        onLocationSelect({ lat: 0, lng: 0, name: '' });
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                        <Input
                            type="text"
                            placeholder="Buscar por ciudad, provincia o país..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-12 pr-10 bg-gray-900/50 border-gray-800 text-white placeholder-gray-500 h-12 rounded-xl"
                        />
                        {selectedLocation && (
                            <button
                                onClick={clearLocation}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion.id}
                                    onClick={() => handleLocationSelect(suggestion)}
                                    className="w-full p-4 text-left hover:bg-gray-800/50 transition-colors flex items-center gap-3 border-b border-gray-800 last:border-b-0"
                                >
                                    <MapPin className="text-nasa-blue" size={18} />
                                    <div>
                                        <div className="text-white font-medium">{suggestion.name}</div>
                                        <div className="text-gray-400 text-sm capitalize">{suggestion.type}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {onFiltersToggle && (
                    <Button
                        variant={showFilters ? 'primary' : 'outline'}
                        onClick={onFiltersToggle}
                        className="h-12 px-6 rounded-xl"
                    >
                        <Filter size={20} className="mr-2" />
                        Filtros
                    </Button>
                )}
            </div>

            {selectedLocation && onRadiusChange && (
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="location">
                            <MapPin size={14} className="mr-1" />
                            {selectedLocation.name}
                        </Badge>
                        <span className="text-gray-400 text-sm">Radio de búsqueda:</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="range"
                            min="10"
                            max="500"
                            step="10"
                            value={radius}
                            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                            className="w-32 accent-nasa-blue"
                        />
                        <span className="text-white font-medium w-16">{radius} km</span>
                    </div>
                </div>
            )}
        </div>
    );
};
