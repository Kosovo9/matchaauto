# MATCH-AUTO: ARQUITECTURA DE ALMACENAMIENTO DE MEDIOS 10X

Para soportar un crecimiento masivo con **costos mínimos** y **latencia cero**, utilizaremos el ecosistema de Cloudflare. Esta arquitectura es 1000% compatible con el despliegue en el Edge.

---

## 1. ALMACENAMIENTO DE IMÁGENES (Cloudflare R2 + Images)

### 1.1. Flujo de Carga y Entrega
1.  **Upload:** El usuario sube la imagen desde el frontend directamente a un **Presigned URL** de Cloudflare R2 (generado por un Worker). Esto evita que el tráfico pase por nuestro servidor, reduciendo latencia y carga.
2.  **Storage:** Las imágenes originales se guardan en **Cloudflare R2**.
    *   **Costo:** $0.015 / GB al mes.
    *   **Egress:** **$0 (Gratis).** Esta es la clave del ahorro 10x vs AWS S3.
3.  **Delivery:** Se sirven a través de **Cloudflare Images**.
    *   **Optimización:** Conversión automática a WebP/AVIF según el navegador.
    *   **Resizing:** Se generan variantes (thumbnail, medium, full) al vuelo mediante parámetros en la URL (ej. `https://imagedelivery.net/ID/listing_123/public`).

### 1.2. Optimización de Costos (Escala de Millones)
| Métrica | AWS S3 + CloudFront | Cloudflare R2 + Images | Ahorro 10x |
| :--- | :--- | :--- | :--- |
| **Almacenamiento (1TB)** | ~$23.00 | $15.00 | -35% |
| **Transferencia (10TB)** | ~$850.00 | **$0.00** | **-100%** |
| **Operaciones (1M)** | ~$5.00 | $0.36 | -92% |

---

## 2. ALMACENAMIENTO DE VIDEOS (Cloudflare Stream)

Los usuarios de planes VP pueden subir videos de alta calidad. Cloudflare Stream maneja todo el pipeline de video.

### 2.1. Características Técnicas
*   **Adaptive Bitrate Streaming (ABR):** El video se ajusta automáticamente a la velocidad de internet del usuario (como YouTube/Netflix).
*   **Global Delivery:** El video se cachea en los 330+ nodos de Cloudflare.
*   **Player Integrado:** Player de alto rendimiento, personalizable con la marca Match-Auto.

### 2.2. Estructura de Costos
*   **Almacenamiento:** $1.00 por cada 1,000 minutos de video guardados al mes.
*   **Entrega:** $1.00 por cada 1,000 minutos de video vistos.
*   **Sin costos ocultos:** No pagas por transcodificación ni por ancho de banda de salida.

---

## 3. IMPLEMENTACIÓN TÉCNICA (Wrangler & Pages)

### 3.1. Configuración de `wrangler.toml`
```toml
name = "match-auto-media-api"
main = "src/index.ts"
compatibility_date = "2025-12-31"

# Binding de R2 para acceso directo desde el Worker
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "match-auto-assets"

# Variables de entorno para Cloudflare Images/Stream
[vars]
CLOUDFLARE_ACCOUNT_ID = "tu_account_id"
STREAM_API_TOKEN = "tu_stream_token"
```

### 3.2. Script de Upload (Edge Worker)
```typescript
// Generar URL firmada para upload directo a R2
async function getUploadUrl(env, fileName) {
  const objectKey = `listings/${Date.now()}-${fileName}`;
  return await env.MEDIA_BUCKET.createSignedUrl('put', objectKey, {
    expiresIn: 3600, // 1 hora
  });
}
```

---

## 4. SEGURIDAD DE MEDIOS (Anti-Scraping)
*   **Signed URLs:** Solo los usuarios autenticados pueden generar links de carga.
*   **Hotlink Protection:** Las imágenes solo se cargan si el `Referer` es `match-auto.com`.
*   **Watermarking:** Cloudflare Images aplica automáticamente una marca de agua con el logo de Match-Auto a todas las fotos de los listings.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - The Billion Dollar Marketplace 🚀
