/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
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
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
            },
            {
                protocol: 'https',
                hostname: '**.netlify.app',
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
    typescript: {
        ignoreBuildErrors: true,
    },
};

module.exports = nextConfig;
