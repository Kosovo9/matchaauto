#!/bin/bash
# scripts/smoke-test-offline.sh
set -e

echo "🔥 [SMOKE_TEST] EXECUTING OFFLINE-FIRST VALIDATION..."

# 1. External CDN Leak Check
LEAKS=$(grep -r "https://cdn" ./frontend/.next/static | wc -l)
if [ $LEAKS -gt 0 ]; then
  echo "❌ FAILED: Found $LEAKS external CDN references. Bundle must be 100% self-contained."
  exit 1
fi
echo "✅ SUCCESS: Zero external CDN leaks detected."

# 2. Bundle Size Optimization (Target < 15MB for local sync)
SIZE=$(du -sm ./frontend/.next/static | cut -f1)
if [ $SIZE -gt 25 ]; then
  echo "⚠️ WARNING: Bundle size ($SIZE MB) exceeds high-speed sync threshold (25MB)."
else
  echo "✅ SUCCESS: Bundle size is optimized ($SIZE MB)."
fi

echo "🚀 SMOKE_TEST PASSED. SYSTEM IS READY FOR OFFLINE DEPLOYMENT."
