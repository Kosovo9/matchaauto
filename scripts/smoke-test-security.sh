#!/bin/bash
# Trinity Diamond - Security Validation
# Intenta acceder a una ruta protegida por Honeypot

echo "🛡️ Validando Capas de Seguridad..."

# Using ports Frontend 3000, Backend 3001
FE_URL="http://localhost:3000"
BE_URL="http://localhost:3001"

# 1. Test Honeypot (Debe retornar 403 o redirección trampa)
HONEYPOT=$(curl -s -o /dev/null -w "%{http_code}" $FE_URL/.env )
if [ "$HONEYPOT" == "403" ] || [ "$HONEYPOT" == "301" ] || [ "$HONEYPOT" == "440" ]; then
    echo "✅ Honeypot FE: ACTIVO Y PROTEGIENDO ($HONEYPOT)"
else
    echo "⚠️ Honeypot FE: VULNERABLE ($HONEYPOT)"
fi

# 2. Test Rate-Limit
echo "Testing Rate-Limit on Backend..."
for i in {1..10}; do curl -s -o /dev/null $BE_URL/api/health; done
LAST_REQ=$(curl -s -o /dev/null -w "%{http_code}" $BE_URL/api/health )
echo "Última petición tras ráfaga: $LAST_REQ"
