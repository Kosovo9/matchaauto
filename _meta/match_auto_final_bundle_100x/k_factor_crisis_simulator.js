/**
 * MATCH-AUTO: VIRAL K-FACTOR CRISIS SIMULATOR
 * Este Worker simula una caída drástica en la viralidad para probar las alertas de PagerDuty.
 */

export default {
  async fetch(request, env) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 1. Simulación de caída crítica (K-Factor < 1.0)
    const simulated_metrics = {
      viral_k_factor: 0.65, // Nivel de crisis (Objetivo: 1.2)
      total_invites: 1500,
      new_users_from_invites: 975,
      timestamp: new Date().toISOString()
    };

    // 2. Lógica de disparo de alerta
    let alert_sent = false;
    if (simulated_metrics.viral_k_factor < 1.0) {
      alert_sent = true;
      // En producción, aquí se llamaría a la API de PagerDuty/Slack
      // await sendPagerDutyAlert(simulated_metrics, env);
    }

    // 3. Respuesta detallada para el Super Panel
    return new Response(JSON.stringify({
      success: true,
      simulation_mode: "CRISIS_TEST",
      metrics: simulated_metrics,
      alert_triggered: alert_sent,
      severity: "CRITICAL",
      message: "Simulación de caída de viralidad ejecutada. Alerta enviada a PagerDuty."
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

async function sendPagerDutyAlert(metrics, env) {
  // Ejemplo de integración con PagerDuty Events API v2
  const payload = {
    payload: {
      summary: `🚨 CRISIS DE CRECIMIENTO: Viral K-Factor ha caído a ${metrics.viral_k_factor}`,
      severity: "critical",
      source: "Match-Auto Growth Engine",
      component: "Viral-Module",
      group: "Marketing-Ops",
      custom_details: metrics
    },
    routing_key: env.PAGERDUTY_ROUTING_KEY,
    event_action: "trigger"
  };

  return fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
