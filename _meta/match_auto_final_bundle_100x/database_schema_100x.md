# MATCH-AUTO: ESQUEMA DE BASE DE DATOS 100X

Para lograr una escalabilidad de 100x y latencia cero, utilizaremos un enfoque híbrido: **Cloudflare D1** (SQLite en el Edge) para datos de lectura intensiva y **Supabase PostgreSQL** para datos relacionales complejos y transaccionales.

---

## 1. ESTRATEGIA DE DATOS HÍBRIDA

| Capa | Tecnología | Uso Principal | Beneficio 100x |
| :--- | :--- | :--- | :--- |
| **Edge Cache (Read)** | **Cloudflare D1** | Ubicaciones, Categorías, Configuración, Cache de Listings populares. | Latencia <50ms global. |
| **Primary DB (Write/Relational)** | **Supabase (PostgreSQL)** | Usuarios, Listings, Mensajes, Transacciones, Ads. | Integridad referencial, RLS, PostGIS. |
| **Real-time / NoSQL** | **Supabase Realtime** | Chat, Notificaciones, Vistas en vivo. | Sincronización instantánea sin polling. |

---

## 2. ESQUEMA SQL (PostgreSQL / D1)

### 2.1. Usuarios y Perfiles (Auth por Clerk)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'affiliate', 'admin', 'vp')),
  trust_score FLOAT DEFAULT 5.0,
  language_pref TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2. Listings de Vehículos (Optimizado para Búsqueda)
```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  category_id INT,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  condition TEXT CHECK (condition IN ('new', 'used', 'certified')),
  make TEXT,
  model TEXT,
  year INT,
  mileage INT,
  location_id INT, -- Referencia a tabla de ciudades
  geo_point GEOGRAPHY(POINT), -- Para búsquedas por radio (PostGIS)
  media_urls JSONB, -- Array de URLs de R2/Stream
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending', 'flagged')),
  is_featured BOOLEAN DEFAULT FALSE,
  is_vp BOOLEAN DEFAULT FALSE,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice GIST para búsquedas geográficas rápidas
CREATE INDEX idx_listings_geo ON listings USING GIST (geo_point);
```

### 2.3. Match-Ads (Sistema de Publicidad)
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES profiles(id),
  title TEXT,
  content_url TEXT, -- Imagen/Video en R2
  target_geo JSONB, -- Países/Ciudades objetivo
  target_categories INT[], -- Categorías objetivo
  budget_daily DECIMAL(10,2),
  budget_total DECIMAL(10,2),
  spent_total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
);

CREATE TABLE ad_metrics (
  ad_id UUID REFERENCES ads(id),
  date DATE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  PRIMARY KEY (ad_id, date)
);
```

### 2.4. Afiliados y Transacciones
```sql
CREATE TABLE affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES profiles(id),
  referred_user_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  amount DECIMAL(12,2),
  type TEXT CHECK (type IN ('ad_payment', 'featured_listing', 'affiliate_payout', 'donation')),
  status TEXT DEFAULT 'completed',
  metadata JSONB, -- Detalles adicionales
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. ARSENAL DE SEGURIDAD OPEN SOURCE "NIVEL DIOS"

Para blindar la plataforma, utilizaremos las mejores herramientas de código abierto integradas en cada capa.

### 3.1. Capa de Red y Aplicación (WAF/Anti-Bot)
*   **Cloudflare WAF (Open Ruleset):** Reglas de seguridad basadas en OWASP para prevenir SQLi, XSS y CSRF.
*   **Coraza WAF:** Si decidimos usar servidores propios (Go-based), Coraza es el mejor WAF open source compatible con reglas ModSecurity.
*   **Fail2Ban:** Para bloqueo automático de IPs que muestran comportamiento malicioso en logs.

### 3.2. Capa de Autenticación y Autorización
*   **Clerk (Core):** Gestión de identidad, 2FA, y sesiones.
*   **Casbin:** Motor de control de acceso (RBAC/ABAC) open source para gestionar permisos complejos en el Super Admin Panel.
*   **Zod:** Validación de esquemas en TypeScript para asegurar que ningún dato malformado entre a la API.

### 3.3. Capa de Datos y Privacidad
*   **Vault (HashiCorp):** Gestión de secretos, llaves de API y encriptación de datos sensibles fuera de la base de datos principal.
*   **PostgreSQL RLS:** Seguridad a nivel de fila nativa para asegurar que los usuarios solo vean sus propios datos.
*   **Cryptographic Watermarking:** Algoritmos open source para insertar marcas de agua invisibles en imágenes (ej. usando librerías de procesamiento de imágenes en Python/Node).

### 3.4. Capa de Monitoreo y Detección
*   **Grafana + Prometheus:** Monitoreo en tiempo real de tráfico y anomalías.
*   **Wazuh:** Plataforma de seguridad open source para detección de intrusiones (HIDS), monitoreo de integridad de archivos y respuesta ante incidentes.
*   **Hugging Face (AI Moderation):** Modelos como `facebook/detr-resnet-50` para detección de objetos prohibidos en imágenes y modelos de NLP para detectar spam/estafas en el chat.

---

## 4. RESUMEN DE BLINDAJE 100X

1.  **Anti-Copy:** Watermarking dinámico + Deshabilitar clic derecho (básico) + Tokenización de URLs de medios.
2.  **Anti-Scraping 500%:** Cloudflare Bot Management + Rate Limiting agresivo + Honeypots.
3.  **Anti-Hacking:** Zero Trust + RLS + Validación Zod + Auditoría inmutable.
4.  **Anti-Spam:** Moderación por AI en tiempo real (Hugging Face).

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - The Billion Dollar Marketplace 🚀
