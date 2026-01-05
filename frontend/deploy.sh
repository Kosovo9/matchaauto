#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment process..."

# Build the application
echo "📦 Building application..."
docker-compose build frontend

# Run tests
echo "🧪 Running tests..."
docker-compose run --rm frontend npm test

# Fix metadata
echo "🔧 Fixing metadata..."
docker-compose run --rm frontend npm run fix:metadata

# Build for production
echo "🏗️ Building for production..."
docker-compose run --rm frontend npm run build

# Build for Cloudflare
echo "☁️ Building for Cloudflare Pages..."
docker-compose up cloudflare-build

echo "✅ Build completed! Output in cf-output directory"
echo "📁 Upload the contents of cf-output to Cloudflare Pages"
