# PROTOCOLO DE PRUEBAS SEGURAS: K-FACTOR SIMULATOR

Para asegurar que las simulaciones de crisis no contaminen los datos reales de producción, seguiremos este protocolo estricto.

---

## 1. AISLAMIENTO DE DATOS (SANDBOXING)

### 1.1. Header de Simulación
*   Toda petición generada por el `k_factor_crisis_simulator.js` debe incluir el header `X-Match-Auto-Simulation: true`.
*   El sistema de métricas (D1/Supabase) ignorará cualquier dato que contenga este header para los reportes financieros reales.

### 1.2. Entorno de Alertas (PagerDuty Sandbox)
*   Las alertas del simulador se enviarán a una **Service Key de PagerDuty específica para pruebas**, nunca a la cola de producción.
*   Esto permite validar el flujo de notificación sin despertar al equipo de guardia real.

---

## 2. PROCEDIMIENTO DE PRUEBA

1.  **Activación:** El administrador activa el simulador desde el Super Panel en modo "TEST".
2.  **Validación de Alerta:** Confirmar que la alerta llega al canal de Slack `#test-alerts` en < 10s.
3.  **Limpieza:** El simulador se apaga automáticamente tras 5 minutos de ejecución.
4.  **Verificación de Producción:** Confirmar en el dashboard real que el K-Factor legítimo no ha sufrido variaciones.

---

## 3. SEGURIDAD NIVEL DIOS
El simulador tiene un **bloqueo por IP** y requiere el `ADMIN_SECRET`. Es imposible activarlo accidentalmente desde el exterior.

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Safe Crisis Simulation 🛡️✅
