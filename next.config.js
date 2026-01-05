/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'img.autocosmos.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.imagin.studio',
            },
            {
                protocol: 'https',
                hostname: '**.cloudflare.com',
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787',
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    },
    experimental: {
        optimizePackageImports: ['@tanstack/react-query', 'recharts', 'lucide-react'],
    },
};

module.exports = nextConfig;
