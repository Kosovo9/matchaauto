import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from './providers/ThemeProvider';
import { SentinelProvider } from './providers/SentinelProvider';
import { SolanaProvider } from './providers/SolanaProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Match-Auto | Global Marketplace 1000X',
    description: 'Edge-native marketplace with Solana payments, AI moderation, and viral growth engine.',
    keywords: ['marketplace', 'solana', 'edge computing', 'AI', 'web3'],
    authors: [{ name: 'Match-Auto Team' }],
    creator: 'Match-Auto',
    publisher: 'Match-Auto',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://match-auto.com',
        title: 'Match-Auto | Global Marketplace 1000X',
        description: 'Edge-native marketplace with Solana payments, AI moderation, and viral growth engine.',
        siteName: 'Match-Auto',
        images: [
            {
                url: 'https://match-auto.com/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Match-Auto Marketplace',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Match-Auto | Global Marketplace 1000X',
        description: 'Edge-native marketplace with Solana payments, AI moderation, and viral growth engine.',
        images: ['https://match-auto.com/twitter-image.jpg'],
        creator: '@matchauto',
    },
    manifest: 'https://match-auto.com/manifest.json',
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-icon.png' },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider
            appearance={{
                variables: {
                    colorPrimary: '#3b82f6',
                    colorText: '#0a0a0a',
                    colorTextSecondary: '#525252',
                    colorBackground: '#ffffff',
                    colorInputBackground: '#fafafa',
                    colorInputText: '#0a0a0a',
                },
                elements: {
                    formButtonPrimary:
                        'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
                    card: 'bg-white/80 backdrop-blur-lg border border-gray-200 shadow-2xl',
                    headerTitle: 'text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent',
                },
            }}
        >
            <html
                lang="en"
                className={`${inter.variable} ${spaceGrotesk.variable}`}
                suppressHydrationWarning
            >
                <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <SolanaProvider>
                            <SentinelProvider>
                                <div className="relative min-h-screen">
                                    {/* Animated background particles */}
                                    <div className="fixed inset-0 -z-10 overflow-hidden">
                                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
                                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-green-500/20 to-cyan-500/20 blur-3xl" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 blur-3xl" />
                                    </div>

                                    {/* Main content */}
                                    <Navbar />
                                    <main className="pt-16">
                                        <div className="relative isolate">
                                            <div
                                                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                                                aria-hidden="true"
                                            >
                                                <div
                                                    className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                                                    style={{
                                                        clipPath:
                                                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                                                    }}
                                                />
                                            </div>
                                            {children}
                                        </div>
                                    </main>
                                    <Footer />
                                </div>
                                <Toaster
                                    position="bottom-right"
                                    toastOptions={{
                                        className: 'bg-white/90 backdrop-blur-lg border border-gray-200',
                                        duration: 4000,
                                    }}
                                />
                            </SentinelProvider>
                        </SolanaProvider>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
