/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        optimizeCss: true,
        optimizeServerReact: true,
        serverComponentsExternalPackages: ['@solana/web3.js', 'crypto'],
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.match-auto.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.cloudflare.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                pathname: '/**',
            },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/avif', 'image/webp'],
    },
    headers: async () => [
        {
            source: '/:path*',
            headers: [
                {
                    key: 'X-DNS-Prefetch-Control',
                    value: 'on',
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff',
                },
                {
                    key: 'X-Frame-Options',
                    value: 'DENY',
                },
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block',
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin',
                },
                {
                    key: 'Permissions-Policy',
                    value: 'camera=(), microphone=(), geolocation=()',
                },
            ],
        },
    ],
    rewrites: async () => [
        {
            source: '/api/:path*',
            destination: 'https://api.match-auto.com/api/:path*',
        },
    ],
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false,
                net: false,
                tls: false,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                os: require.resolve('os-browserify'),
            };
        }
        return config;
    },
};

module.exports = nextConfig;
