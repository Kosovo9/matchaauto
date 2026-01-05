#!/bin/bash
# verification.sh

echo "🔍 Verificando conexiones..."

# Verificar frontend
echo "1. Probando frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend RESPONDE en http://localhost:3000"
else
    echo "❌ Frontend NO RESPONDE"
fi

# Verificar backend
echo "2. Probando backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend RESPONDE en http://localhost:8000"
else
    echo "❌ Backend NO RESPONDE"
fi

# Verificar conexión entre servicios
echo "3. Probando conexión frontend->backend..."
if docker-compose exec frontend curl -s http://backend:8000/health > /dev/null; then
    echo "✅ Frontend PUEDE comunicarse con Backend"
else
    echo "❌ Frontend NO PUEDE comunicarse con Backend"
fi

# Verificar base de datos
echo "4. Probando base de datos..."
if docker-compose exec db pg_isready -U postgres; then
    echo "✅ Base de datos CONECTADA"
else
    echo "❌ Base de datos NO CONECTADA"
fi

echo ""
echo "📊 ESTADO COMPLETO:"
docker-compose ps
