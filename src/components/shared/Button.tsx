'use client';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'nasa';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) => {
    const variants = {
        primary: 'bg-white text-black hover:bg-white/90',
        secondary: 'bg-gray-800 text-white hover:bg-gray-700',
        outline: 'border border-gray-700 text-white hover:bg-gray-800',
        ghost: 'text-gray-400 hover:text-white hover:bg-gray-800',
        nasa: 'bg-nasa-blue text-white hover:bg-blue-700 shadow-[0_0_20px_rgba(0,50,160,0.4)]',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
};
