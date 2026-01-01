# SENTINEL-X: LÓGICA DEL THREAT INTENSITY INDEX (TII)

El **Threat Intensity Index (TII)** es el algoritmo central de Sentinel-X que cuantifica el nivel de amenaza en tiempo real y activa contramedidas automáticas.

---

## 1. CÁLCULO DEL TII (ALGORITMO)

El TII se calcula cada 60 segundos mediante una suma ponderada de cuatro vectores de ataque principales:

$$TII = (W_s \cdot S) + (W_d \cdot D) + (W_i \cdot I) + (W_b \cdot B)$$

| Vector | Variable | Peso ($W$) | Descripción |
| :--- | :--- | :--- | :--- |
| **Scraping** | $S$ | 0.30 | Ratio de peticiones de bots detectadas vs. tráfico humano. |
| **DDoS** | $D$ | 0.40 | Incremento porcentual de peticiones por segundo (RPS) sobre la media. |
| **Inyecciones** | $I$ | 0.20 | Número de intentos de SQLi/XSS bloqueados por el WAF. |
| **Brute Force** | $B$ | 0.10 | Intentos fallidos de login en endpoints de autenticación. |

### Escala del TII:
*   **0 - 20 (Verde):** Tráfico normal. Seguridad estándar activa.
*   **21 - 50 (Amarillo):** Actividad sospechosa. Activación de desafíos Turnstile aleatorios.
*   **51 - 80 (Naranja):** Ataque en curso. Activación del **Refuerzo 500%**.
*   **81 - 100 (Rojo):** Ataque crítico. Modo "Under Attack" global y bloqueo de regiones hostiles.

---

## 2. EL REFUERZO AUTOMÁTICO DEL 500%

Cuando el TII cruza el umbral de 50, Sentinel-X activa el **Refuerzo 500%**, que multiplica la efectividad de la seguridad mediante tres acciones clave:

### 2.1. Verificación Criptográfica Obligatoria
Se deja de confiar en las cookies de sesión estándar. Cada petición a la API debe incluir un **Header de Firma Dinámica** generado por un script de JS ofuscado en el cliente que expira cada 30 segundos. Esto hace que el scraping sea 500% más difícil de automatizar.

### 2.2. Rate Limiting Agresivo (Dynamic Throttling)
El límite de peticiones se reduce drásticamente para IPs sospechosas:
*   **Normal:** 100 req / min.
*   **Refuerzo 500%:** 20 req / min + Desafío Turnstile obligatorio por cada 5 peticiones.

### 2.3. Ofuscación de Payload
Sentinel-X ordena a los Workers encriptar las respuestas JSON de la API con una llave rotativa. Solo el cliente legítimo de Match-Auto puede desencriptar y mostrar los datos, neutralizando cualquier intento de extracción de datos en bruto.

---

## 3. APRENDIZAJE AUTÓNOMO (FEEDBACK LOOP)
Si un ataque logra superar el TII inicial pero es detectado posteriormente por comportamiento (ej. un usuario que ve 500 listings en 1 minuto), Sentinel-X:
1.  Identifica el patrón que falló en el TII.
2.  Ajusta los pesos ($W$) automáticamente para detectar ese patrón en el futuro.
3.  Reporta el ajuste al Super Admin Panel.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Sentinel-X Intelligence 🛡️🧠
