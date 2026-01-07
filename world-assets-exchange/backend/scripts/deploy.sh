#!/bin/bash

set -e

echo "🚀 Desplegando Match-Auto Backend en producción..."

# Verificar que el archivo .env.production exista
if [ ! -f .env.production ]; then
    echo "❌ Error: El archivo .env.production no existe."
    exit 1
fi

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
docker compose -f docker-compose.production.yml build

# Iniciar los servicios
echo "🚀 Iniciando servicios..."
docker compose -f docker-compose.production.yml up -d

# Esperar a que los servicios estén saludables
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar el estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker compose -f docker-compose.production.yml ps

echo "🎉 ¡Despliegue completado!"
