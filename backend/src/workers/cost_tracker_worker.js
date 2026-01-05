/**
 * MATCH-AUTO: REAL-TIME COST TRACKER WORKER
 * Este Worker recopila métricas de uso de Cloudflare y Supabase 
 * para proyectar costos en tiempo real en el Super Admin Panel.
 */

export default {
  async fetch(request, env, ctx) {
    // 1. Seguridad: Solo permitir acceso desde el Super Admin Panel
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      // 2. Obtener métricas de Cloudflare (Simulado mediante API de CF)
      // En producción, usarías: https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/billing/usage
      const cfUsage = {
        workers_requests: 1250000, // Ejemplo: 1.25M req
        r2_storage_gb: 450,        // Ejemplo: 450GB
        r2_egress_gb: 12000,       // Ejemplo: 12TB (Ahorro clave!)
        images_transformed: 45000
      };

      // 3. Lógica de Cálculo de Costos (Tarifas Cloudflare 2026)
      const costs = {
        workers: (cfUsage.workers_requests / 1000000) * 0.15,
        r2_storage: cfUsage.r2_storage_gb * 0.015,
        r2_egress_savings: cfUsage.r2_egress_gb * 0.09, // Ahorro vs AWS ($0.09/GB)
        images: (cfUsage.images_transformed / 100000) * 5.00,
        infrastructure_total: 0
      };

      costs.infrastructure_total = costs.workers + costs.r2_storage + costs.images;

      // 4. Proyección Mensual (Burn Rate)
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const currentDay = now.getDate();
      costs.projected_monthly = (costs.infrastructure_total / currentDay) * daysInMonth;

      // 5. Respuesta para el Super Panel
      return new Response(JSON.stringify({
        success: true,
        timestamp: now.toISOString(),
        currency: "USD",
        current_usage: cfUsage,
        costs: costs,
        savings_vs_aws: costs.r2_egress_savings
      }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
