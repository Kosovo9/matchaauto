/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['images.unsplash.com', 'cdn.sanity.io', 'lh3.googleusercontent.com'],
        formats: ['image/avif', 'image/webp'],
    },
    // No output: 'export' – using full SSR
};

module.exports = nextConfig;
