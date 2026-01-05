import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/auth-provider'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Match-Auto | Global Auto Parts Marketplace',
    description: 'AI-powered, Solana-secured global automotive marketplace',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-gray-950 text-white`}>
                <AuthProvider>
                    <Navigation />
                    <main className="min-h-screen">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                    <Footer />
                    <Toaster position="top-right" />
                </AuthProvider>
            </body>
        </html>
    )
}
