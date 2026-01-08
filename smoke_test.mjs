
const fetchJSON = async (url, options) => {
    const res = await fetch(url, options);
    return res.json();
};

const run = async () => {
    const userId = "00000000-0000-0000-0000-000000000001";
    const unverifiedId = "00000000-0000-0000-0000-000000000002";
    const baseUrl = "http://127.0.0.1:3003/api/verifications";
    const boostUrl = "http://127.0.0.1:3003/api/boosts/checkout";
    const headers = {
        "Content-Type": "application/json",
        "x-user-id": userId
    };

    console.log("--- SMOKE TEST: VERIFICATION & BOOST GATING ---\n");

    // 1. Request
    const req = await fetchJSON(`${baseUrl}/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ docType: "passport", fileUrl: "https://demo.com/doc.mp4" })
    });
    console.log("A) Request Sent:", req.status);

    // 2. Status (Pending)
    const status1 = await fetchJSON(`${baseUrl}/me`, { headers });
    console.log("B) Status (Pending):", status1.status);

    // 3. Admin Approve
    const decide = await fetchJSON(`${baseUrl}/decide`, {
        method: 'POST',
        headers: { ...headers, "x-user-id": "00000000-0000-0000-0000-000000000000" },
        body: JSON.stringify({ verificationId: req.id, decision: "approved", note: "10x Verified" })
    });
    console.log("C) Admin Decision:", decide.status);

    // 4. Boost Gating (Unverified)
    const boost1 = await fetchJSON(boostUrl, {
        method: 'POST',
        headers: { ...headers, "x-user-id": unverifiedId },
        body: JSON.stringify({ listingId: "car-123", planId: "diamond" })
    });
    console.log("D) Boost Unverified (403):", boost1.code);

    // 5. Boost Gating (Verified)
    const boost2 = await fetchJSON(boostUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ listingId: "car-123", planId: "diamond" })
    });
    console.log("E) Boost Verified (200):", boost2.success ? "SUCCESS" : "FAIL");
};

run();
