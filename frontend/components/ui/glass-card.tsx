import { cn } from '@/lib/utils'
import React from 'react'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    intensity?: 'light' | 'medium' | 'heavy'
}

export function GlassCard({
    children,
    className,
    intensity = 'medium',
    ...props
}: GlassCardProps) {
    const intensityClasses = {
        light: 'backdrop-blur-sm bg-white/5 border-white/10',
        medium: 'backdrop-blur-md bg-white/10 border-white/20',
        heavy: 'backdrop-blur-lg bg-white/15 border-white/30'
    }

    return (
        <div
            className={cn(
                'rounded-2xl border shadow-2xl shadow-black/20',
                intensityClasses[intensity],
                'transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl hover:shadow-primary/20',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
