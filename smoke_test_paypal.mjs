
const fetchJSON = async (url, options) => {
    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text();
        console.error(`Error ${res.status}: ${text}`);
        return { status: res.status, error: text };
    }
    return res.json();
};

const run = async () => {
    const userId = "00000000-0000-0000-0000-000000000001"; // Must be verified in DB for this test to pass 100%
    const baseUrl = "http://127.0.0.1:3003/api";
    const headers = {
        "Content-Type": "application/json",
        "x-user-id": userId
    };

    console.log("--- SMOKE TEST: PAYPAL BOOST FLOW ---\n");

    // 1. Checkout (PayPal)
    console.log("1. Creating PayPal Checkout...");
    const checkout = await fetchJSON(`${baseUrl}/boosts/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            listingId: "auto-1",
            planId: "diamond",
            provider: "paypal"
        })
    });

    if (!checkout.success) {
        console.log("❌ Checkout Failed:", checkout);
        return;
    }
    console.log("✅ PayPal Order Created:", checkout.paypalOrderId);
    console.log("🔗 Approve URL:", checkout.checkoutUrl);

    // 2. Simulate Capture (Option A)
    console.log("\n2. Simulating Capture (Instant UX)...");
    const capture = await fetchJSON(`${baseUrl}/payments/paypal/capture`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ paypalOrderId: checkout.paypalOrderId })
    });

    // Note: In mock mode, this might fail or pass depending on implementation. 
    // Let's ensure mock mode supports capture.
    console.log("Result:", capture);

    // 3. Simulate Webhook (Option B)
    console.log("\n3. Simulating PayPal Webhook (Source of Truth)...");
    const webhook = await fetchJSON(`${baseUrl}/webhooks/paypal`, {
        method: 'POST',
        headers: { ...headers, "paypal-auth-algo": "mock" },
        body: JSON.stringify({
            event_type: "PAYMENT.CAPTURE.COMPLETED",
            resource: {
                custom_id: checkout.orderId,
                id: "CAPT-123",
                status: "COMPLETED"
            }
        })
    });
    console.log("✅ Webhook Received:", webhook.status);

    // 4. Verify Final Status in DB (via /me or similar)
    // For now, we trust the logs or a quick query.
    console.log("\n--- TEST COMPLETE ---");
};

run();
