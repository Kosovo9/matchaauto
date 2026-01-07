/**
 * MATCH-AUTO: HIGH-FIDELITY COST SIMULATOR WORKER
 * Este Worker genera datos de uso realistas para pruebas y desarrollo.
 */

export default {
  async fetch(request, env) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Simulación de fluctuación de tráfico (basada en la hora actual)
    const hour = new Date().getHours();
    const trafficMultiplier = 1 + Math.sin((hour / 24) * Math.PI); // Pico al mediodía

    const usage = {
      workers_requests: Math.floor(1000000 * trafficMultiplier),
      r2_storage_gb: 500 + Math.floor(Math.random() * 50),
      r2_egress_gb: Math.floor(5000 * trafficMultiplier),
      d1_rows_read: Math.floor(10000000 * trafficMultiplier),
      images_transformed: Math.floor(50000 * trafficMultiplier)
    };

    const costs = {
      workers: (usage.workers_requests / 1000000) * 0.15,
      r2_storage: usage.r2_storage_gb * 0.015,
      d1: (usage.d1_rows_read / 1000000) * 0.001,
      images: (usage.images_transformed / 100000) * 5.00,
      infrastructure_total: 0
    };

    costs.infrastructure_total = costs.workers + costs.r2_storage + costs.d1 + costs.images;
    
    // Ahorro vs AWS ($0.09/GB egress)
    const savings_vs_aws = usage.r2_egress_gb * 0.09;

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate() || 1;
    const projected_monthly = (costs.infrastructure_total / currentDay) * daysInMonth;

    return new Response(JSON.stringify({
      success: true,
      timestamp: now.toISOString(),
      current_usage: usage,
      costs: costs,
      savings_vs_aws: savings_vs_aws,
      projected_monthly: projected_monthly
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Ajustar en producción
      }
    });
  }
};
