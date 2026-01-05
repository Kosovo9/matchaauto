import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className,
    children,
    disabled,
    ...props
}) => {
    const variantStyles = {
        primary: 'bg-nasa-blue text-white hover:bg-nasa-blue/90 shadow-lg shadow-nasa-blue/20',
        secondary: 'bg-gray-800 text-white hover:bg-gray-700',
        outline: 'border border-gray-700 text-gray-300 hover:border-nasa-blue hover:text-nasa-blue',
        ghost: 'text-gray-400 hover:text-white hover:bg-gray-800/50',
        danger: 'bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/30',
    };

    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                'rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            )}
            {children}
        </button>
    );
};
