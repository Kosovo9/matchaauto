#!/bin/bash
# 📁 scripts/deploy-ultimate.sh

echo "🚀 INICIANDO DEPLOY ULTIMATE BUNDLE 100X"
echo "========================================="
echo "Timestamp: $(date)"
echo ""

# 1. Verificar configuración
echo "🔍 Verificando configuración..."
if [ ! -f "backend/wrangler.toml" ]; then
    echo "❌ backend/wrangler.toml no encontrado"
    exit 1
fi

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
cd backend
npm install --omit=dev --legacy-peer-deps
cd ..

# 3. Desplegar Workers principales
echo "⚡ Desplegando Workers principales..."
cd backend
npx wrangler deploy
cd ..

# 4. Desplegar Admin Dashboard
echo "📊 Desplegando Admin Dashboard..."
cd match-auto-admin
npx wrangler pages deploy public --project-name match-auto-admin
cd ..

echo "🏁 DEPLOY ULTIMATE BUNDLE COMPLETADO"
