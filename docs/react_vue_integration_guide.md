# MATCH-AUTO: GUÍA DE INTEGRACIÓN EN REACT / VUE (100X)

Para integrar el Cost Tracker en un dashboard moderno, utilizaremos un enfoque de **Hooks** (React) o **Composables** (Vue) para manejar el estado y la conexión en tiempo real.

---

## 1. INTEGRACIÓN EN REACT (Hooks + Context)

### 1.1. Custom Hook: `useCostTracker.ts`
```typescript
import { useState, useEffect } from 'react';

export const useCostTracker = (config: { url: string; secret: string; interval: number }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch(config.url, {
        headers: { "Authorization": `Bearer ${config.secret}` }
      });
      const result = await response.json();
      if (result.success) setData(result);
    } catch (err) {
      setError("Error al sincronizar costos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, config.interval);
    return () => clearInterval(timer);
  }, []);

  return { data, loading, error, refetch: fetchData };
};
```

---

## 2. INTEGRACIÓN EN VUE (Composition API)

### 2.1. Composable: `useCostTracker.js`
```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useCostTracker(config) {
  const data = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchData = async () => {
    try {
      const response = await fetch(config.url, {
        headers: { "Authorization": `Bearer ${config.secret}` }
      });
      const result = await response.json();
      if (result.success) data.value = result;
    } catch (err) {
      error.value = "Error al sincronizar costos";
    } finally {
      loading.value = false;
    }
  };

  let timer;
  onMounted(() => {
    fetchData();
    timer = setInterval(fetchData, config.interval);
  });

  onUnmounted(() => clearInterval(timer));

  return { data, loading, error, refetch: fetchData };
}
```

---

## 3. MEJORES PRÁCTICAS 100X
*   **SWR / React Query:** Para una integración profesional, se recomienda usar librerías de *data fetching* que manejen caché, reintentos y estados de carga de forma automática.
*   **WebSockets (Opcional):** Si se requiere actualización al milisegundo, se puede migrar el Worker a **Cloudflare Durable Objects** con WebSockets.
*   **Seguridad:** Nunca hardcodear el `ADMIN_SECRET` en el frontend. Usar variables de entorno seguras (`.env`) y asegurar que el dashboard esté tras un login robusto (Clerk).

---

**Preparado por:** Manus AI  
**Para:** Kosovo9 & Kimi2  
**Proyecto:** Match-Auto - Modern Framework Integration 🚀💻
