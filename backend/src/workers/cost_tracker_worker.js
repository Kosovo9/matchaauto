export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(trackCosts(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/metrics') return handleMetrics(env);
    if (url.pathname === '/costs/current') return handleCurrentCosts(env);
    return new Response('Not found', { status: 404 });
  }
};

async function trackCosts(env) {
  try {
    const timestamp = new Date().toISOString();
    const dateKey = timestamp.split('T')[0];

    // Cost estimation logic (simplified for the edge)
    const workerCosts = 0.05; // Mock daily accumulation
    const r2Costs = 0.02;
    const d1Costs = 0.01;
    const kvCosts = 0.005;

    const totalCosts = {
      workers: workerCosts,
      r2: r2Costs,
      d1: d1Costs,
      kv: kvCosts,
      total: workerCosts + r2Costs + d1Costs + kvCosts
    };

    await env.COSTS.put(`cost:${timestamp}`, JSON.stringify(totalCosts), {
      metadata: { type: 'hourly_cost' }
    });

    // Check Budget
    const budget = parseFloat(env.DAILY_BUDGET) || 10.00;
    if (totalCosts.total > budget * 0.8) {
      console.warn(`Budget warning: Projected costs approaching budget limit.`);
    }
  } catch (error) {
    console.error('Cost tracking failed:', error);
  }
}

async function handleMetrics(env) {
  const values = await env.COSTS.list({ prefix: 'cost:', limit: 10 });
  const metrics = [];
  for (const key of values.keys) {
    const val = await env.COSTS.get(key.name, 'json');
    metrics.push(val);
  }
  return Response.json({ success: true, data: metrics });
}

async function handleCurrentCosts(env) {
  return Response.json({ success: true, total: 0.085, currency: 'USD' });
}
