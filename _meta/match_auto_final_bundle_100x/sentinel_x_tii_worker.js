/**
 * SENTINEL-X: THREAT INTENSITY INDEX (TII) WORKER
 * Este Worker calcula el nivel de amenaza en tiempo real y activa el Refuerzo 500%.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 1. Recopilar métricas de la petición actual
    const metrics = {
      is_bot: request.cf.botManagement?.score < 30, // Cloudflare Bot Score
      is_ddos: request.headers.get("cf-connecting-ip-rate") > 100, // Simulado
      is_injection: /select|union|insert|drop|<script>/i.test(url.search),
      is_brute_force: url.pathname.includes("/login") && request.method === "POST"
    };

    // 2. Cálculo del TII (Suma Ponderada)
    let tii = 0;
    if (metrics.is_bot) tii += 30;
    if (metrics.is_ddos) tii += 40;
    if (metrics.is_injection) tii += 20;
    if (metrics.is_brute_force) tii += 10;

    // 3. Lógica de Refuerzo Automático 500%
    let security_headers = {
      "X-Sentinel-X-TII": tii.toString(),
      "X-Sentinel-X-Status": "Standard"
    };

    if (tii > 50) {
      // ACTIVAR REFUERZO 500%
      security_headers["X-Sentinel-X-Status"] = "Reinforced-500";
      security_headers["X-Sentinel-X-Action"] = "Challenge-Required";
      
      // Si el TII es crítico, bloquear o desafiar con Turnstile
      if (tii > 80) {
        return new Response("Security Challenge Required", { 
          status: 403, 
          headers: { ...security_headers, "Content-Type": "text/plain" } 
        });
      }
    }

    // 4. Reportar a la base de datos de métricas (Async)
    // ctx.waitUntil(reportToMetricsDB(tii, metrics));

    // 5. Continuar con la petición original agregando headers de seguridad
    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    Object.keys(security_headers).forEach(key => {
      newResponse.headers.set(key, security_headers[key]);
    });

    return newResponse;
  }
};
