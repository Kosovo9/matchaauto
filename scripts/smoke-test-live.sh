#!/bin/bash
# Trinity Diamond - Live Smoke Test 100x
# Ubicación: /scripts/smoke-test-live.sh

TARGET_URL="https://www.match-autos.com"
echo "🚀 Iniciando Live Smoke Test (100x) en $TARGET_URL"

for i in {1..100}
do
   # Medir tiempo de respuesta (TTFB) y código de estado
   RESPONSE=$(curl -s -o /dev/null -w "Status:%{http_code} | Time:%{time_starttransfer}s" "$TARGET_URL" )
   
   STATUS=$(echo $RESPONSE | cut -d' ' -f1 | cut -d':' -f2)
   TIME=$(echo $RESPONSE | cut -d' ' -f3 | cut -d':' -f2)

   if [ "$STATUS" == "200" ]; then
       echo "✅ [$i/100] LIVE OK | Latencia: $TIME"
   else
       echo "🚨 [$i/100] ERROR LIVE | Status: $STATUS | Latencia: $TIME"
   fi
   
   sleep 0.5
done
