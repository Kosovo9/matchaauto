#!/bin/bash
# security/emergency-self-destruct.sh
# ⚠️ WARNING: THIS SCRIPT PERMANENTLY DELETES DATA. USE ONLY IN CRISIS.

echo "🚨 [CRITICAL] EMERGENCY SELF-DESTRUCT INITIATED"
echo "AUTHORIZATION: LEVEL 10"

# 1. Stop all services
docker-compose down -v --remove-orphans

# 2. Shred sensitive files
declare -a SENSITIVE_FILES=(".env" ".env.local" "secrets/" "backend/.env" "frontend/.env")

for file in "${SENSITIVE_FILES[@]}"; do
  if [ -f "$file" ] || [ -d "$file" ]; then
    echo "🌕 Shredding $file..."
    shred -u -n 35 -z "$file" 2>/dev/null || rm -rf "$file"
  fi
done

# 3. Purge DB Volumes
docker volume prune -f

echo "💥 DATA PURGE COMPLETE. SYSTEM IS NEUTRALIZED."
