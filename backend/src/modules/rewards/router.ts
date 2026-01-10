import { Hono } from "hono";
import { rewardsEnabled, allowCountry } from "./flags";
import {
    getWallet,
    ledgerPage,
    captureReferral,
    donateImpact,
    creditCashback,
    settleReferralFirstPay,
    expireCredits
} from "./service";

export const rewardsRouter = new Hono();

// Guard global
rewardsRouter.use('*', async (c, next) => {
    if (!rewardsEnabled()) return c.json({ ok: false }, 404);
    if (!allowCountry(c)) return c.json({ ok: false, reason: "country_block" }, 403);
    await next();
});

// Wallet
rewardsRouter.get("/wallet", async (c) => {
    const userId = c.req.header("x-user-id") || "demo"; // adapta a tu auth real luego
    const currency = (c.req.query("currency") || "MXN") as any;
    const balance = await getWallet(String(userId), currency);
    return c.json({ ok: true, currency, balanceCents: balance });
});

rewardsRouter.get("/ledger", async (c) => {
    const userId = c.req.header("x-user-id") || "demo";
    const currency = (c.req.query("currency") || "MXN") as any;
    const limit = Math.min(Number(c.req.query("limit") || 20), 50);
    const items = await ledgerPage(String(userId), currency, limit);
    return c.json({ ok: true, items });
});

// Referrals capture
rewardsRouter.post("/referrals/capture", async (c) => {
    const userId = c.req.header("x-user-id") || "demo";
    const { code } = await c.req.json() || {};
    if (!code) return c.json({ ok: false }, 400);
    await captureReferral(String(code), String(userId));
    return c.json({ ok: true });
});

// Impact donate
rewardsRouter.post("/impact/donate", async (c) => {
    const userId = c.req.header("x-user-id") || "demo";
    const { currency = "MXN", amountCents, charityId } = await c.req.json() || {};
    await donateImpact(String(userId), currency, Number(amountCents), charityId || null);
    return c.json({ ok: true });
});

// INTERNAL (protegido)
rewardsRouter.post("/internal/apply-cashback", async (c) => {
    if (c.req.header("x-internal-secret") !== process.env.INTERNAL_CRON_SECRET) return c.json({ ok: false }, 403);
    const { userId, currency, grossCents, basePercent, provider, paymentId } = await c.req.json() || {};
    const out = await creditCashback(String(userId), currency, Number(grossCents), Number(basePercent), { provider, id: paymentId });
    return c.json({ ok: true, ...out });
});

rewardsRouter.post("/internal/referrals/settle-first-pay", async (c) => {
    if (c.req.header("x-internal-secret") !== process.env.INTERNAL_CRON_SECRET) return c.json({ ok: false }, 403);
    const { referredUserId, currency, paymentId } = await c.req.json() || {};
    const out = await settleReferralFirstPay(String(referredUserId), currency, String(paymentId));
    return c.json(out);
});

// Cron expire
rewardsRouter.post("/internal/expire", async (c) => {
    if (c.req.header("x-internal-secret") !== process.env.INTERNAL_CRON_SECRET) return c.json({ ok: false }, 403);
    const out = await expireCredits();
    return c.json({ ok: true, ...out });
});
