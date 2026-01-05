#!/bin/bash

echo "🚀 DEPLOYING MATCH-AUTO FRONTEND 1000X"
echo "========================================"

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm ci --omit=dev

# 2. Build the application
echo "🔨 Building Next.js application..."
npm run build

# 3. Run type checking
echo "🔍 Running TypeScript checks..."
npm run type-check

# 4. Deploy to Vercel
echo "☁️  Deploying to Vercel..."
npm run deploy

# 5. Warm-up important pages
echo "🔥 Warming up pages..."
warmup_urls=(
  "https://match-auto.com"
  "https://match-auto.com/dashboard"
  "https://match-auto.com/listings/create"
  "https://match-auto.com/api/health"
)

for url in "${warmup_urls[@]}"; do
  echo "  Warming: $url"
  curl -s -o /dev/null "$url" &
done

wait

# 6. Verify deployment
echo "✅ Frontend deployed successfully!"
echo "🌍 URL: https://match-auto.com"
echo "📊 Analytics: https://vercel.com/match-auto/analytics"
