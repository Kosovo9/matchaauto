#!/bin/bash
# Community Resilience Global - Respaldo automático a USB
# Detecta USB y guarda HUBS/SEÑALES en /CommunityResilience_Backup/

BACKUP_DIR="CommunityResilience_Backup"
CRP_DIR="$HOME/CommunityResilience/crp"

# Crear carpeta de respaldo si no existe
mkdir -p "$CRP_DIR"

echo "📡 Esperando USB para respaldo automático..."

# Loop infinito para detectar conexiones
while true; do
  # Buscar puntos de montaje de USB (simplificado)
  for mount in /media/$USER/* /Volumes/*; do
    if [ -d "$mount" ]; then
      echo "💾 USB detectado: $mount"
      mkdir -p "$mount/$BACKUP_DIR"
      cp -u "$CRP_DIR"/*.crp "$mount/$BACKUP_DIR/" 2>/dev/null
      echo "✅ Respaldo completado en $(date)"
    fi
  done
  sleep 10
done
