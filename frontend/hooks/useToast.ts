"use client"

import { toast as sonnerToast } from "sonner"

export function useToast() {
    return {
        toast: ({ title, description, variant, duration }: {
            title: string,
            description?: string,
            variant?: 'default' | 'destructive',
            duration?: number
        }) => {
            sonnerToast(title, {
                description,
                duration: duration || 4000,
                className: variant === 'destructive' ? 'bg-red-500 text-white' : undefined,
            })
        }
    }
}
