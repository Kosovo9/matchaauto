#!/bin/bash
echo "🌍 Community Resilience Global - Instalador Offline"
echo "-----------------------------------------------"
echo "⏳ Copiando aplicación..."

# Crear carpeta local
mkdir -p "$HOME/CommunityResilience"

# Copiar app
if [ -d "$(dirname "$0")/app/community-resilience-hubs-offline" ]; then
  cp -r "$(dirname "$0")/app/community-resilience-hubs-offline"/* "$HOME/CommunityResilience/"
  echo "✅ Aplicación instalada en: $HOME/CommunityResilience"
else
  echo "❌ Error: No se encontró la carpeta de la aplicación."
fi

echo ""
echo "📺 Abriendo tutorial..."
# Intentar abrir video con el reproductor por defecto
if command -v xdg-open > /dev/null; then
  xdg-open "$(dirname "$0")/tutorial/tutorial-es.mp4"
elif command -v open > /dev/null; then
  open "$(dirname "$0")/tutorial/tutorial-es.mp4"
fi

echo ""
echo "🎉 ¡Listo!"
