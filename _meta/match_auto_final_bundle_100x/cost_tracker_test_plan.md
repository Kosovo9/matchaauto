# MATCH-AUTO: PLAN DE PRUEBAS GRADO MILITAR (COST TRACKER)

Este plan asegura que el sistema de monitoreo financiero sea infalible, preciso y seguro.

---

## 1. PRUEBAS UNITARIAS (WORKER)

| Test Case | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| **Auth Validation** | Petición sin Header de Authorization. | HTTP 401 Unauthorized. |
| **Calculation Accuracy** | Inyectar valores de uso conocidos. | El costo total debe coincidir con la fórmula exacta. |
| **Projection Logic** | Simular diferentes días del mes. | La proyección mensual debe ser matemáticamente coherente. |
| **Error Handling** | Simular fallo en la API de facturación de CF. | El Worker debe devolver un error JSON estructurado, no un crash. |

---

## 2. PRUEBAS DE INTEGRACIÓN (CLIENTE-SERVIDOR)

| Test Case | Descripción | Resultado Esperado |
| :--- | :--- | :--- |
| **Real-Time Sync** | Verificar actualización cada 30s. | La UI debe reflejar los nuevos datos sin recargar la página. |
| **CORS Security** | Intentar acceder desde un dominio no autorizado. | Bloqueo por política de CORS. |
| **Data Integrity** | Comparar el valor en el Worker vs. el valor mostrado en la UI. | Coincidencia del 100% (sin errores de redondeo). |
| **Network Resilience** | Simular pérdida de conexión a internet. | La UI debe mostrar un estado de "Desconectado" o "Error de Sincronización". |

---

## 3. PRUEBAS DE SEGURIDAD (PEN-TESTING)

1.  **Token Leakage:** Verificar que el `ADMIN_SECRET` no sea visible en los logs del navegador ni en el código fuente ofuscado.
2.  **Rate Limiting:** Intentar saturar el Worker de costos con 1,000 peticiones/seg. El sistema debe bloquear la IP atacante automáticamente.
3.  **Payload Tampering:** Intentar enviar datos malformados al Worker. El sistema debe rechazar la petición mediante validación de esquema (Zod).

---

## 4. AUTOMATIZACIÓN (CI/CD)
*   **GitHub Actions:** Ejecutar la suite de pruebas (Vitest/Jest) en cada Pull Request.
*   **Wrangler Dev:** Pruebas en entorno local antes de cada despliegue a producción.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Quality Assurance 🛡️✅
