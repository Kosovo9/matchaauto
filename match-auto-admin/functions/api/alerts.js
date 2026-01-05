export async function onRequest(context) {
    const { env } = context;

    // 1. Seguridad: Validar acceso (Cloudflare Access o Token)
    // 2. Fetch a PagerDuty API
    const response = await fetch("https://api.pagerduty.com/incidents", {
        headers: {
            "Authorization": `Token token=${env.PAGERDUTY_API_KEY}`,
            "Accept": "application/vnd.pagerduty+json;version=2"
        }
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" }
    });
}
