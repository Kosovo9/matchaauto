'use client'

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { SolanaProvider } from '@/components/solana-provider' // placeholder, adjust path if needed
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_demo'}
            appearance={{
                variables: { colorPrimary: '#00ff88', colorBackground: '#0a0a14' },
                elements: { formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-purple-600' },
            }}
        >
            <QueryClientProvider client={queryClient}>
                {/* SolanaProvider placeholder – you can replace with actual implementation */}
                <SolanaProvider>{children}</SolanaProvider>
            </QueryClientProvider>
        </ClerkProvider>
    )
}
