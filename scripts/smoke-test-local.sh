#!/bin/bash
# Trinity Diamond - Local Smoke Test 100x
# Ubicación: /scripts/smoke-test-local.sh

echo "🚀 Iniciando Local Smoke Test (100x) - Nivel MIT"
SUCCESS_COUNT=0
FAIL_COUNT=0

# Ports: Frontend 3000, Backend 3001
BACKEND_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

for i in {1..100}
do
   echo "--- Iteración $i/100 ---"
   
   # 1. Check Backend Health
   HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/health )
   
   # 2. Check Backend API Root or specific feature
   GEO_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/geo/nearby?lat=19.4&lng=-99.1" )
   
   # 3. Check Frontend status
   FE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL )

   if [ "$HEALTH" == "200" ] && [ "$FE_STATUS" == "200" ]; then
       ((SUCCESS_COUNT++))
       echo "✅ Iteración $i: PASSED"
   else
       ((FAIL_COUNT++))
       echo "❌ Iteración $i: FAILED (Backend: $HEALTH, Frontend: $FE_STATUS, Geo: $GEO_CHECK)"
   fi
done

echo "-----------------------------------------------"
echo "📊 RESULTADOS LOCALES: $SUCCESS_COUNT PASSED | $FAIL_COUNT FAILED"
if [ $FAIL_COUNT -eq 0 ]; then echo "💎 ESTADO: DIAMANTE (Sólido)"; else echo "⚠️ ESTADO: CRÍTICO"; fi
