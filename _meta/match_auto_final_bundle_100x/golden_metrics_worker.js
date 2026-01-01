/**
 * MATCH-AUTO: GOLDEN METRICS AUTOMATION WORKER
 * Este Worker calcula Ad Fill Rate, Conversion Rate y Viral K-Factor en tiempo real.
 */

export default {
  async fetch(request, env) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    try {
      // 1. Obtener datos de Supabase/D1 (Simulado para el ejemplo)
      // En producción, realizarías queries a las tablas de Ads, Users y Referrals.
      const stats = {
        total_ad_slots: 10000,
        filled_ad_slots: 4500,
        new_users_free: 5000,
        new_users_vp: 350,
        total_invites_sent: 2000,
        total_users_from_invites: 2500
      };

      // 2. Cálculo de las 3 Métricas de Oro
      const metrics = {
        ad_fill_rate: (stats.filled_ad_slots / stats.total_ad_slots) * 100,
        conversion_rate_vp: (stats.new_users_vp / stats.new_users_free) * 100,
        viral_k_factor: stats.total_users_from_invites / stats.total_invites_sent
      };

      // 3. Evaluación de Salud de Métricas (vs Objetivos Semana 1)
      const health = {
        ad_fill_rate: metrics.ad_fill_rate >= 40 ? "GOOD" : "LOW",
        conversion_rate_vp: metrics.conversion_rate_vp >= 5 ? "GOOD" : "LOW",
        viral_k_factor: metrics.viral_k_factor >= 1.2 ? "GOOD" : "LOW"
      };

      // 4. Respuesta para el Super Panel
      return new Response(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        metrics: metrics,
        health: health,
        recommendation: health.viral_k_factor === "LOW" ? "Activar campaña de referidos 2x" : "Mantener estrategia actual"
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
