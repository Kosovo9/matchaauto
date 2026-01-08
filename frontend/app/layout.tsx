import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../providers/auth-provider'
import { Navigation } from '../components/navigation'
import { Footer } from '../components/Footer'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = 'force-dynamic'

export const viewport = {
    width: 'device-width',
    initialScale: 1,
}

export const metadata: Metadata = {
    title: {
        default: 'Match-Auto | La Plataforma Automotriz Cuántica No. 1',
        template: '%s | Match-Auto'
    },
    description: 'Buscador inteligente AI, marketplace de autos, refacciones y servicios con seguridad presidencial y pagos instantáneos.',
    keywords: ['autos', 'compra-venta', 'refacciones', 'servicios automotrices', 'AI car search', 'México', 'Quantum Marketplace'],
    authors: [{ name: 'Match-Auto Team' }],

    openGraph: {
        type: 'website',
        locale: 'es_MX',
        url: 'https://matchaauto.netlify.app',
        siteName: 'Match-Auto',
        title: 'Match-Auto | Quantum Automotive Marketplace',
        description: 'Vende, renta y compra autos y refacciones con Inteligencia Artificial. La tecnología del futuro para el mercado de hoy.',
        images: [{
            url: 'https://matchaauto.netlify.app/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Match-Auto Quantum UI'
        }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Match-Auto | Quantum Automotive Engine',
        description: 'Vende tu auto en segundos con análisis de imagen por IA.',
        images: ['https://matchaauto.netlify.app/og-image.jpg'],
    },
    robots: {
        index: true,
        follow: true,
    }
}

import { Providers } from '../components/providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#39FF14" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </head>
            <body className={`${inter.className} hero-gradient min-h-screen`}>
                <Providers>
                    <AuthProvider>
                        <Navigation />
                        <main className="min-h-screen">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                {children}
                            </div>
                        </main>
                        <Footer />
                        <Toaster position="top-right" reverseOrder={false} />
                    </AuthProvider>
                </Providers>
            </body>
        </html>
    )
}
