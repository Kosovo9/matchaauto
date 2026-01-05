import { cn } from '@/lib/utils'
import React from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    variant?: 'default' | 'premium' | 'gradient'
    size?: 'sm' | 'md' | 'lg'
    withArrow?: boolean
    withSparkles?: boolean
}

export function AnimatedButton({
    children,
    className,
    variant = 'default',
    size = 'md',
    withArrow = false,
    withSparkles = false,
    ...props
}: AnimatedButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0'

    const variantClasses = {
        default: 'bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg',
        premium: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/25',
        gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/25'
    }

    const sizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    }

    return (
        <button
            className={cn(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                'group relative overflow-hidden',
                className
            )}
            {...props}
        >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
                {withSparkles && <Sparkles className="w-4 h-4" />}
                {children}
                {withArrow && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
        </button>
    )
}
