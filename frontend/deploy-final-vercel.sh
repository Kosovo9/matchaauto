#!/bin/bash

echo "🚀 DEPLOY DEFINITIVO A VERCEL - MATCH-AUTO GLOBAL"

# 1. Verificar estado
echo "🔍 Verificando estado del repositorio..."
git status
git log --oneline -3

# 2. Limpiar caches
echo "🧹 Limpiando caches..."
rm -rf .next node_modules/.cache

# 3. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

# 4. Verificar build
echo "🏗️ Probando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ BUILD EXITOSO!"
    
    # 5. Iniciar Vercel deploy
    echo "🌐 Iniciando deploy en Vercel..."
    
    # Opción A: Si Vercel CLI está instalado
    if command -v vercel &> /dev/null; then
        echo "🚀 Usando Vercel CLI..."
        vercel --prod --confirm
    else
        echo "📦 Vercel CLI no encontrado. Instalando..."
        npm install -g vercel
        
        echo "🔑 Por favor, inicia sesión en Vercel:"
        echo "   vercel login"
        echo "   vercel --prod"
    fi
    
    echo "==========================================="
    echo "🎉 ¡PROYECTO LISTO PARA DEPLOY!"
    echo "🌐 Vercel URL: https://match-auto.vercel.app"
    echo "🔗 GitHub: https://github.com/Kosovo9/Match-auto"
    echo "==========================================="
    
else
    echo "❌ Build falló. Revisar errores:"
    npm run build 2>&1 | grep -i error
    exit 1
fi
