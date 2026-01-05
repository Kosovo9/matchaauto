export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(calculateMetrics(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/metrics/k-factor') return handleKFactorMetrics(env);
    return new Response('Not found', { status: 404 });
  }
};

async function calculateMetrics(env) {
  try {
    const timestamp = new Date().toISOString();

    // Viral Data analysis
    const viralEvents = await env.VIRAL_DATA.list({ prefix: 'event:' });
    let invitesSent = 100; // Mock data
    let invitesAccepted = 55;

    const kFactor = (invitesAccepted / invitesSent).toFixed(3);

    const goldenMetrics = {
      timestamp,
      kFactor: {
        kFactor,
        level: kFactor > 0.5 ? 'healthy' : 'moderate',
        emoji: kFactor > 0.5 ? '🚀' : '📊'
      }
    };

    await env.GOLDEN_METRICS.put(`metrics:${timestamp}`, JSON.stringify(goldenMetrics));
  } catch (error) {
    console.error('Metrics calculation failed:', error);
  }
}

async function handleKFactorMetrics(env) {
  const latest = await env.GOLDEN_METRICS.list({ prefix: 'metrics:', limit: 1 });
  if (latest.keys.length === 0) return Response.json({ success: false, error: 'No data' });
  const data = await env.GOLDEN_METRICS.get(latest.keys[0].name, 'json');
  return Response.json({ success: true, data });
}
