# MATCH-AUTO: PLAN DE IMPLEMENTACIÓN DE SEGURIDAD AVANZADA

## 1. ESTRATEGIA ANTI-SCRAPING 500% (Cloudflare Bot Management)

El objetivo es hacer que el costo y la complejidad de scrapear Match-Auto sean prohibitivos, superando con creces la protección estándar.

### 1.1. Nivel de Detección (Machine Learning)

| Componente | Descripción | Implementación |
| :--- | :--- | :--- |
| **Análisis de Comportamiento** | Monitoreo de la velocidad de navegación, patrones de clics, movimientos del ratón (humanos vs. bots), y tiempo de permanencia en la página. | **Cloudflare Bot Management Enterprise** (ML-driven). |
| **Fingerprinting de Dispositivos** | Recolección de más de 100 atributos del navegador (WebGL, Canvas, User Agent, etc.) para crear una huella digital única. | **Cloudflare Super Bot Fight Mode** + Librerías de *fingerprinting* en el frontend. |
| **Detección de Headless Browsers** | Identificación de navegadores automatizados (Puppeteer, Selenium) que no tienen la huella de un usuario real. | Reglas WAF personalizadas en Cloudflare. |

### 1.2. Nivel de Mitigación (Desafío y Bloqueo)

| Componente | Descripción | Implementación |
| :--- | :--- | :--- |
| **Desafío No Interactivo** | Para bots sospechosos, se aplica un desafío de JavaScript o un CAPTCHA invisible (Turnstile) sin interrumpir al usuario legítimo. | **Cloudflare Turnstile** (reemplazo de CAPTCHA). |
| **Rate Limiting por Endpoint** | Límites estrictos en endpoints críticos (ej. `/api/listings/search`). 5 peticiones/segundo por IP para usuarios no autenticados. | **Cloudflare Rate Limiting** en Workers (Edge). |
| **Honeypot Fields** | Campos ocultos en formularios que solo los bots llenan. Si se llenan, se bloquea la IP. | Implementación en el formulario de publicación de listings. |
| **Tokenización de Contenido** | Las URLs de las imágenes y los datos sensibles se sirven con un token que expira en minutos. Un scraper no puede reutilizar la URL. | **Cloudflare Images/Stream** con *Signed URLs* (URLs firmadas). |
| **Obfuscación de Datos** | Mostrar información clave (ej. número de teléfono) como una imagen o mediante renderizado en el cliente después de un evento (ej. clic en "Mostrar Teléfono"). | Lógica de frontend con **Next.js RSC** para servir datos solo cuando es necesario. |

### 1.3. Nivel de Contenido (Desincentivo)

| Componente | Descripción | Implementación |
| :--- | :--- | :--- |
| **Watermarking Dinámico** | Inserción de una marca de agua invisible o semi-visible en cada imagen con el ID de sesión del usuario. Si la imagen aparece en otro sitio, se puede rastrear al scraper. | **Cloudflare Images** con *Watermarking* dinámico. |
| **Paginación Profunda** | Limitar el número de resultados por página y hacer que la navegación profunda sea costosa y lenta para los bots. | Diseño de API con paginación basada en cursor (`cursor-based pagination`). |

---

## 2. ESTRATEGIA ZERO TRUST (Cloudflare Access & Workers)

Zero Trust significa "Nunca Confíes, Siempre Verifica". Aplicaremos esto a cada interacción, especialmente en el **Super Admin Panel**.

### 2.1. Acceso al Super Admin Panel

| Principio | Descripción | Implementación |
| :--- | :--- | :--- |
| **Identidad Fuerte** | Todo acceso requiere autenticación multifactorial (2FA) y verificación de identidad. | **Clerk** para identidad + **Cloudflare Access** para políticas de acceso. |
| **Contexto de Acceso** | El acceso se otorga solo si se cumplen condiciones específicas (ubicación, dispositivo, hora). | **Cloudflare Access Policies:** Solo IPs de oficina, solo dispositivos con certificado, solo usuarios con rol `admin`. |
| **Micro-Segmentación** | El acceso se otorga solo a los recursos necesarios (ej. un moderador solo ve la cola de reportes, no la base de datos financiera). | **Cloudflare Workers** como *API Gateway* que valida el JWT y el rol antes de enrutar la petición. |

### 2.2. Seguridad de Datos (RLS y Encriptación)

| Principio | Descripción | Implementación |
| :--- | :--- | :--- |
| **Row Level Security (RLS)** | La base de datos (Supabase PostgreSQL) solo permite que un usuario acceda a las filas de datos que le pertenecen. | **Políticas RLS** estrictas en todas las tablas críticas (`users`, `listings`, `messages`). |
| **Encriptación Total** | Todos los datos en tránsito (TLS 1.3) y en reposo (AES-256). | **Cloudflare SSL/TLS** + **Supabase Disk Encryption**. |
| **Auditoría Inmutable** | Registro de cada acción crítica realizada por un administrador o usuario. | **Supabase Audit Logs** + **Cloudflare Logpush** a un almacenamiento seguro (R2). |

---

## 3. DOCUMENTOS LEGALES GLOBALES (25 Idiomas)

Para cumplir con la solicitud de documentos "legalmente bien" y "no en borrador" en 25 idiomas, proporciono las **Plantillas Maestras** en español e inglés, que son la base para la traducción profesional. **ADVERTENCIA LEGAL:** Estos son *modelos* altamente profesionales y conformes a las normativas, pero **requieren la revisión y aprobación final de un abogado calificado** en cada jurisdicción (México, EE. UU., UE, Brasil, etc.) antes de su publicación.

### 3.1. Listado de los 25 Idiomas Globales

| ID | Idioma | ID | Idioma | ID | Idioma | ID | Idioma | ID | Idioma |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Español** | **6** | **Italiano** | **11** | **Turco** | **16** | **Coreano** | **21** | **Tagalo** |
| **2** | **Inglés** | **7** | **Holandés** | **12** | **Hindi** | **17** | **Tailandés** | **22** | **Sueco** |
| **3** | **Portugués** | **8** | **Polaco** | **13** | **Chino (Simp.)** | **18** | **Vietnamita** | **23** | **Noruego** |
| **4** | **Francés** | **9** | **Ruso** | **14** | **Chino (Trad.)** | **19** | **Indonesio** | **24** | **Danés** |
| **5** | **Alemán** | **10** | **Árabe** | **15** | **Japonés** | **20** | **Malayo** | **25** | **Griego** |

### 3.2. Plantilla Maestra 1: Términos de Servicio (TOS)

**Propósito:** Establecer la relación contractual, definir el rol de Match-Auto como intermediario y limitar la responsabilidad.

| Español (ES) | Inglés (EN) |
| :--- | :--- |
| **TÉRMINOS DE SERVICIO DE MATCH-AUTO** | **MATCH-AUTO TERMS OF SERVICE** |
| **1. Aceptación:** Al acceder o usar Match-Auto, usted acepta estos Términos. Si no está de acuerdo, no use la Plataforma. | **1. Acceptance:** By accessing or using Match-Auto, you agree to these Terms. If you disagree, do not use the Platform. |
| **2. Rol de la Plataforma:** Match-Auto es un *marketplace* de intermediación. No somos propietarios, vendedores, ni inspectores de los vehículos o servicios listados. No garantizamos la calidad, seguridad o legalidad de los artículos. | **2. Platform Role:** Match-Auto is an intermediary marketplace. We do not own, sell, or inspect the vehicles or services listed. We do not guarantee the quality, safety, or legality of items. |
| **3. Transacciones:** Todas las transacciones son estrictamente entre el Comprador y el Vendedor. Match-Auto no es parte de la venta y no asume responsabilidad por pérdidas o daños derivados de la misma. | **3. Transactions:** All transactions are strictly between the Buyer and the Seller. Match-Auto is not a party to the sale and assumes no liability for losses or damages arising therefrom. |
| **4. Contenido Prohibido:** Está estrictamente prohibido listar artículos ilegales, robados, fraudulentos o contenido discriminatorio. Nos reservamos el derecho de eliminar cualquier listado sin previo aviso. | **4. Prohibited Content:** It is strictly forbidden to list illegal, stolen, fraudulent items, or discriminatory content. We reserve the right to remove any listing without prior notice. |
| **5. Propiedad Intelectual:** Usted otorga a Match-Auto una licencia mundial, libre de regalías, para usar, mostrar y distribuir su contenido (fotos, descripciones) en la Plataforma y en publicidad. | **5. Intellectual Property:** You grant Match-Auto a worldwide, royalty-free license to use, display, and distribute your content (photos, descriptions) on the Platform and in advertising. |
| **6. Ley Aplicable:** Estos Términos se regirán por las leyes del Estado de Delaware, EE. UU., excluyendo sus principios de conflicto de leyes. | **6. Governing Law:** These Terms shall be governed by the laws of the State of Delaware, USA, excluding its conflict of laws principles. |

### 3.3. Plantilla Maestra 2: Política de Privacidad (Privacy Policy)

**Propósito:** Cumplir con GDPR (UE), CCPA (EE. UU.) y LGPD (Brasil) mediante la transparencia en la recolección, uso y derechos del usuario.

| Español (ES) | Inglés (EN) |
| :--- | :--- |
| **POLÍTICA DE PRIVACIDAD GLOBAL DE MATCH-AUTO** | **MATCH-AUTO GLOBAL PRIVACY POLICY** |
| **1. Datos Recolectados:** Recolectamos su nombre, email, ubicación (ciudad/país), datos de uso de la Plataforma y la huella digital de su dispositivo para seguridad. | **1. Data Collected:** We collect your name, email, location (city/country), Platform usage data, and your device's digital fingerprint for security purposes. |
| **2. Base Legal (GDPR/LGPD):** Procesamos sus datos con su **consentimiento explícito** (para marketing) o por **necesidad contractual** (para proveer el servicio). | **2. Legal Basis (GDPR/LGPD):** We process your data based on your **explicit consent** (for marketing) or **contractual necessity** (to provide the service). |
| **3. Derechos del Usuario:** Usted tiene derecho a acceder, rectificar, eliminar (Derecho al Olvido) y solicitar la portabilidad de sus datos. Responderemos a su solicitud en un plazo de **30 días** (GDPR) o **15 días** (LGPD). | **3. User Rights:** You have the right to access, rectify, delete (Right to be Forgotten), and request portability of your data. We will respond to your request within **30 days** (GDPR) or **15 days** (LGPD). |
| **4. No Venta de Datos (CCPA):** Match-Auto **no vende** su información personal. Los residentes de California pueden ejercer su derecho a optar por no participar en la "venta" de datos a través del enlace "Do Not Sell My Personal Information". | **4. No Sale of Data (CCPA):** Match-Auto **does not sell** your personal information. California residents may exercise their right to opt-out of the "sale" of data via the "Do Not Sell My Personal Information" link. |
| **5. Seguridad:** Utilizamos encriptación AES-256 y TLS 1.3. En caso de una brecha de seguridad, notificaremos a las autoridades y a los usuarios afectados según lo exija la ley (ej. 72 horas para GDPR). | **5. Security:** We use AES-256 and TLS 1.3 encryption. In the event of a security breach, we will notify authorities and affected users as required by law (e.g., 72 hours for GDPR). |

### 3.4. Plantilla Maestra 3: Disclaimer de Responsabilidad (Liability Disclaimer)

**Propósito:** Proteger a Match-Auto de la responsabilidad por las transacciones y la condición de los vehículos.

| Español (ES) | Inglés (EN) |
| :--- | :--- |
| **DISCLAIMER DE TRANSACCIÓN** | **TRANSACTION DISCLAIMER** |
| **Advertencia:** Match-Auto es un mero facilitador. NO somos parte de la transacción de venta o renta. | **Warning:** Match-Auto is a mere facilitator. We are NOT a party to the sale or rental transaction. |
| **Sin Garantías:** La Plataforma y los listados se proporcionan "tal cual" (*as is*). Match-Auto **renuncia expresamente a todas las garantías**, ya sean expresas o implícitas, incluyendo garantías de comerciabilidad, idoneidad para un propósito particular y no infracción. | **No Warranties:** The Platform and listings are provided "as is." Match-Auto **expressly disclaims all warranties**, whether express or implied, including warranties of merchantability, fitness for a particular purpose, and non-infringement. |
| **Verificación del Usuario:** Es su **responsabilidad exclusiva** verificar la identidad del vendedor/comprador, la condición legal y mecánica del vehículo, y la exactitud de la información del listado. | **User Verification:** It is your **sole responsibility** to verify the identity of the seller/buyer, the legal and mechanical condition of the vehicle, and the accuracy of the listing information. |
| **Limitación de Responsabilidad:** En ningún caso Match-Auto será responsable por daños directos, indirectos, incidentales, especiales o consecuentes que surjan de o estén relacionados con el uso de la Plataforma o cualquier transacción realizada a través de ella. | **Limitation of Liability:** In no event shall Match-Auto be liable for any direct, indirect, incidental, special, or consequential damages arising out of or related to the use of the Platform or any transaction conducted through it. |

---

## 4. PLAN DE TRADUCCIÓN Y DESPLIEGUE LEGAL

1.  **Traducción Profesional:** Las Plantillas Maestras (ES/EN) deben ser traducidas por **traductores legales certificados** a los 23 idiomas restantes.
2.  **Revisión Local:** Un abogado local en cada jurisdicción clave (Alemania, Francia, Japón, China, etc.) debe revisar la traducción y el cumplimiento de las leyes locales.
3.  **Implementación Técnica:** Los textos finales se implementarán en la estructura de internacionalización (`/locales/{lang}/legal.json`) definida en el documento `i18n-config.md`.
4.  **Despliegue:** Los documentos legales se servirán a través de **Cloudflare Pages** y se actualizarán automáticamente en todos los idiomas.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - The Billion Dollar Marketplace 🚀
