import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'featured' | 'certified' | 'location' | 'warning';
    children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'default',
    children,
    className,
    ...props
}) => {
    const variantStyles = {
        default: 'bg-gray-800 text-gray-300',
        featured: 'bg-gradient-to-r from-orange-500 to-red-500 text-white',
        certified: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        location: 'bg-nasa-blue/20 text-nasa-blue border border-nasa-blue/30',
        warning: 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30',
    };

    return (
        <div
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
