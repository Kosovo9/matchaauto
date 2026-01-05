# Research Notes - Match-Auto Mega Proyecto

## Fecha: 31 Diciembre 2025

---

## 1. ARQUITECTURA FACEBOOK MARKETPLACE (Referencia Principal)

### Requisitos Funcionales:
- Publicar, editar, eliminar productos
- Búsqueda por keywords
- Sistema de mensajería/inquiries
- Notificaciones por email

### Requisitos No-Funcionales:
- **Alta Disponibilidad**: Acceso consistente y confiable
- **Alta Escalabilidad**: Acomodar crecimiento de usuarios e interacciones
- **Alta Seguridad**: Encriptación en tránsito y reposo, autenticación robusta
- **Alta Extensibilidad**: Integración de ML para recomendaciones

### Consideraciones de Diseño:
- **Sistema read-heavy**: Ratio lectura-escritura 100:1
- Posts con hasta 9 fotos cada uno
- Recuperación near real-time

### Estimación de Capacidad (200M usuarios, 1M DAU):
- **Ratio read/write**: 100:1
- **Posts diarios nuevos**: ~10,000
- **Promedio por post**: 50 palabras, 5 fotos (2MB c/u)
- **Storage diario**: ~97.66GB
- **Storage total (5 años)**: ~209TB

### Componentes Arquitectura High-Level:

**Search Requests:**
- Node.js Gateway → Elasticsearch
- Elasticsearch procesa y optimiza búsquedas

**Category & Product Pages:**
- Node.js Gateway → Redis Cluster (cache check)
- Si no hay cache → Application Service Cluster
- Resultados se cachean en Redis (sorted sets)

**Static Files:**
- HDFS para imágenes/videos
- Gestionado por Node.js Gateway

**Advertisement Updates:**
- Application Service Cluster → Message Queue (MQ)
- "Advertisement Update Service" monitorea MQ
- Sincronización con Elasticsearch y Redis

### Sharding Strategy:
- **Consistent Hashing** basado en Product IDs
- Redis para páginas de categorías high-frequency
- Elasticsearch para filtered searches
- Range queries: Query all MySQL shards → Consistent Hash Load Balancer agrega Top N → Return Top 10

### Stack Tecnológico Identificado:
- **Frontend**: React + Nginx Cluster
- **Gateway**: Node.js
- **Search**: Elasticsearch (últimos 3 meses indexados)
- **Cache**: Redis Cluster (LRU, top 20% contenido, top 10 páginas por categoría)
- **Database**: MySQL con sharding
- **Storage**: HDFS para archivos estáticos
- **Message Queue**: Para updates asíncronos

---

## 2. PUNTOS CLAVE PARA MATCH-AUTO

### Diferenciadores vs FB Marketplace:
- **Especialización**: Solo vehículos (carros, motos, aviones, lanchas, etc.)
- **Servicios adicionales**: Renta, vender servicios, productos, refacciones
- **Multi-idioma**: ESP/ENG/POR inicial, expandir a top 25 idiomas
- **Monetización**: Ads (banners publicitarios), NO comisión por ventas

### Requisitos de Seguridad "Nivel Dios":
- Anti-copy
- Anti-scraping 500%
- Anti-cloning
- Anti-screenshots
- Anti-spam
- Anti-hacking
- Encriptación superior a NASA + FBI + Bank of America + CIA

### Requisitos de Performance:
- Speed "quantum 10x"
- Preparado para cientos de millones de usuarios
- Anti-caída de sistema al millón 1000000%

### Timeline Agresivo:
- **Día 1-3**: México solo
- **Día 4**: LATAM, Canadá, EU
- **Día 7**: Global
- **14 días**: Gratis
- **Día 15+**: Modelo freemium + ads

### Stack Propuesto en Documento Original:
- Supabase Full (Auth + PostgreSQL + Storage)
- Cloudflare (D1, KV, Durable Objects)
- Open source tools
- Hugging Face con API
- NO Vercel, NO Stripe

---

## 3. PRÓXIMOS PASOS DE INVESTIGACIÓN

- [ ] Investigar seguridad enterprise-level (anti-scraping, DDoS protection)
- [ ] Arquitecturas open-source escalables (Kubernetes, microservicios)
- [ ] CDN global y edge computing para latencia mínima
- [ ] Sistemas de ads programmatic (Google Ad Manager alternatives)
- [ ] Compliance legal multi-país (GDPR, CCPA, LGPD Brasil, etc.)
- [ ] Database sharding strategies para PostgreSQL
- [ ] Real-time messaging at scale (alternativas a Durable Objects)

---


## 4. COMPLIANCE LEGAL MULTI-PAÍS (GDPR, CCPA/CPRA, LGPD)

### GDPR (Europa) - Requisitos 2025:

**Data Mapping:**
- Documentar flujos de datos con terceros y transferencias cross-border
- Mantener Records of Processing Activities (ROPA) según Artículo 30
- Tools: OneTrust, TrustArc

**Legal Basis (6 bases legales):**
1. Consent (consentimiento)
2. Contractual necessity
3. Legal obligation
4. Vital interests
5. Public task
6. Legitimate interests (requiere Legitimate Interest Assessment)

**DSAR Management (Data Subject Access Requests):**
- Responder en **30 días** (extensible a 60 para casos complejos)
- Portales automatizados para manejo de solicitudes

**DPO (Data Protection Officer) - Obligatorio para:**
- Autoridades públicas
- Monitoreo a gran escala (10,000+ usuarios mensuales)
- Procesamiento de datos sensibles (salud, biométricos)

**Medidas de Seguridad:**
- Encriptación **AES-256** para storage
- **TLS 1.3** para transmisión
- Auditorías anuales alineadas con ISO 27001

---

### CCPA/CPRA (California, USA) - Requisitos 2025:

**Consumer Rights Portal:**
- Link "**Do Not Sell My Personal Information**"
- Soporte para Global Privacy Control (GPC) signal

**Privacy Policy Updates - Divulgar:**
- Categorías de datos recolectados (incluyendo biométricos bajo CPRA)
- Terceros que reciben datos
- Períodos de retención (máx 24 meses a menos que sea legalmente requerido)

**Vendor Contracts:**
- Cláusulas prohibiendo ventas no autorizadas de datos
- Certificaciones anuales de compliance mandatorias

**Penalidades 2025:**
- Multas incrementadas a **$7,500 por violación intencional** (antes $2,500)
- Training trimestral obligatorio para staff

---

### LGPD (Brasil) - Requisitos 2025:

**Data Inventory:**
- Mapear flujos de datos de residentes brasileños
- Rastrear transferencias cross-border que requieren aprobación ANPD
- Tools: SAP Data Privacy Hub, IBM Watson Knowledge Catalog

**Consent Management:**
- Requests en lenguaje claro y simple (**portugués requerido**)
- Retiro fácil de consentimiento vía dashboards

**ANPD Reporting:**
- Notificar brechas **dentro de 48 horas** vía portal online ANPD
- Designar DPO para procesamiento de alto riesgo (ej: credit scoring con AI)

**Data Minimization:**
- Eliminar datos innecesarios después de cumplir propósito
- Máximo 6 meses para datos de marketing

---

### COMPARATIVA RÁPIDA:

| Aspecto | GDPR | CCPA/CPRA | LGPD |
|---------|------|-----------|------|
| **Timeline Respuesta** | 30 días | 45 días | 15 días |
| **Consentimiento** | Explícito opt-in | Opt-out permitido | Explícito opt-in |
| **DPO Obligatorio** | Sí (casos específicos) | No | Sí (alto riesgo) |
| **Multas Máximas** | €20M o 4% revenue | $7,500/violación | R$50M o 2% revenue |
| **Alcance Territorial** | UE + residentes UE | California | Brasil + residentes BR |
| **Notificación Breach** | 72 horas | Sin plazo específico | 48 horas (no oficial) |

---

### IMPLEMENTACIÓN PARA MATCH-AUTO:

**Fase 1 (Día 1-3, México):**
- Implementar consent management básico
- Privacy policy en español
- Cookie banner con opt-in/opt-out

**Fase 2 (Día 4, LATAM + US + Canadá):**
- Activar compliance CCPA (California)
- Activar compliance LGPD (Brasil)
- Multi-idioma: ESP/ENG/POR

**Fase 3 (Día 7, Global):**
- Activar compliance GDPR (Europa)
- Geo-detection automática de regulación aplicable
- Portales DSAR automatizados

**Tools Recomendadas:**
- **OneTrust** o **TrustArc** (enterprise, costoso)
- **Osano** (mid-market, más accesible)
- **CookieYes** (budget-friendly, self-service)
- **Usercentrics** (especializado en consent management)

---
