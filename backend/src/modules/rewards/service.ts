import { q } from "./db";

type Currency = "MXN" | "USD";

const now = () => new Date();

function daysFrom(d: Date, days: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}

export async function ensureWallet(userId: string, currency: Currency) {
    await q(
        `INSERT INTO wallets(user_id, currency, balance_cents)
     VALUES ($1,$2,0)
     ON CONFLICT (user_id, currency) DO NOTHING`,
        [userId, currency]
    );
}

export async function getWallet(userId: string, currency: Currency) {
    await ensureWallet(userId, currency);
    const rows = await q<{ balance_cents: string }>(
        `SELECT balance_cents FROM wallets WHERE user_id=$1 AND currency=$2`,
        [userId, currency]
    );
    return Number(rows[0]?.balance_cents || 0);
}

export async function ledgerPage(userId: string, currency: Currency, limit = 20) {
    return q(
        `SELECT id, type, status, amount_cents, expires_at, ref_type, ref_id, memo, created_at
     FROM ledger_entries
     WHERE user_id=$1 AND wallet_currency=$2
     ORDER BY created_at DESC
     LIMIT $3`,
        [userId, currency, limit]
    );
}

async function applyLedger(userId: string, currency: Currency, type: string, amountCents: number, opts: {
    expiresAt?: Date | null;
    refType?: string | null;
    refId?: string | null;
    memo?: string | null;
} = {}) {
    await ensureWallet(userId, currency);

    if (opts.refType && opts.refId) {
        const existing = await q(
            `SELECT id FROM ledger_entries WHERE ref_type=$1 AND ref_id=$2 AND type=$3 AND user_id=$4`,
            [opts.refType, opts.refId, type, userId]
        );
        if (existing.length) return;
    }

    const rows = await q<{ id: string }>(
        `INSERT INTO ledger_entries(user_id, wallet_currency, type, status, amount_cents, expires_at, ref_type, ref_id, memo)
     VALUES ($1,$2,$3,'POSTED',$4,$5,$6,$7,$8)
     RETURNING id`,
        [userId, currency, type, amountCents, opts.expiresAt || null, opts.refType || null, opts.refId || null, opts.memo || null]
    );

    await q(
        `UPDATE wallets SET balance_cents = balance_cents + $1, updated_at=now()
     WHERE user_id=$2 AND currency=$3`,
        [amountCents, userId, currency]
    );

    return rows[0]?.id;
}

export async function creditCashback(userId: string, currency: Currency, grossCents: number, basePercent: number, paymentRef: { provider: string; id: string; }) {
    const launchBonus = Number(process.env.REWARDS_LAUNCH_BONUS_PERCENT || "5");
    const launchWindow = Number(process.env.REWARDS_LAUNCH_WINDOW_DAYS || "30");
    const expiryDays = Number(process.env.REWARDS_CREDIT_EXPIRY_DAYS || "90");

    const firstPay = await q<{ created_at: string }>(
        `SELECT created_at FROM ledger_entries
     WHERE user_id=$1 AND type='CREDIT_CASHBACK'
     ORDER BY created_at ASC LIMIT 1`,
        [userId]
    );

    let percent = basePercent;
    if (!firstPay.length) {
        percent = basePercent + launchBonus;
    } else {
        const first = new Date(firstPay[0].created_at);
        const within = now().getTime() <= daysFrom(first, launchWindow).getTime();
        if (within) percent = basePercent + launchBonus;
    }

    const cashback = Math.floor(grossCents * (percent / 100));

    const cap = currency === "MXN"
        ? Number(process.env.REWARDS_MONTHLY_CAP_MXN_CENTS || "35000")
        : Number(process.env.REWARDS_MONTHLY_CAP_USD_CENTS || "2000");

    const monthEarned = await q<{ sum: string }>(
        `SELECT COALESCE(SUM(amount_cents),0) as sum
     FROM ledger_entries
     WHERE user_id=$1 AND wallet_currency=$2
       AND type IN ('CREDIT_CASHBACK','CREDIT_REFERRAL_REFERRER','CREDIT_REFERRAL_REFERRED','CREDIT_MISSION')
       AND created_at >= date_trunc('month', now())`,
        [userId, currency]
    );
    const already = Number(monthEarned[0]?.sum || 0);
    const remaining = Math.max(cap - already, 0);
    const final = Math.min(cashback, remaining);

    if (final <= 0) return { percent, credited: 0 };

    await applyLedger(userId, currency, "CREDIT_CASHBACK", final, {
        expiresAt: daysFrom(now(), expiryDays),
        refType: paymentRef.provider,
        refId: paymentRef.id,
        memo: `BoostBack ${percent}%`
    });

    return { percent, credited: final };
}

export async function captureReferral(code: string, referredUserId: string) {
    await q(
        `INSERT INTO referral_captures(code, referred_user_id)
     VALUES($1,$2)
     ON CONFLICT (code, referred_user_id) DO NOTHING`,
        [code, referredUserId]
    );
}

export async function settleReferralFirstPay(referredUserId: string, currency: Currency, paymentId: string) {
    const cap = await q<{ referrer_user_id: string }>(
        `SELECT r.referrer_user_id
     FROM referral_captures c
     JOIN referrals r ON r.code = c.code
     WHERE c.referred_user_id=$1
     LIMIT 1`,
        [referredUserId]
    );
    if (!cap.length) return { ok: false, reason: "no_capture" };

    const referrerUserId = cap[0].referrer_user_id;

    const rr = await q(
        `INSERT INTO referral_rewards(referrer_user_id, referred_user_id, first_paid_ref, rewarded_at)
     VALUES($1,$2,$3, now())
     ON CONFLICT (referrer_user_id, referred_user_id) DO NOTHING
     RETURNING id`,
        [referrerUserId, referredUserId, paymentId]
    );
    if (!rr.length) return { ok: false, reason: "already_rewarded" };

    const referrer = currency === "MXN" ? 12000 : 700;
    const referred = currency === "MXN" ? 6000 : 350;

    await applyLedger(referrerUserId, currency, "CREDIT_REFERRAL_REFERRER", referrer, {
        refType: "REFERRAL",
        refId: `${referredUserId}:${paymentId}`,
        memo: "Referral 1-level reward"
    });

    await applyLedger(referredUserId, currency, "CREDIT_REFERRAL_REFERRED", referred, {
        refType: "REFERRAL",
        refId: `${referredUserId}:${paymentId}:welcome`,
        memo: "Welcome credit"
    });

    return { ok: true };
}

export async function donateImpact(userId: string, currency: Currency, amountCents: number, charityId?: string | null) {
    const bal = await getWallet(userId, currency);
    if (amountCents <= 0) throw new Error("invalid_amount");
    if (bal < amountCents) throw new Error("insufficient_balance");

    const ledgerId = await applyLedger(userId, currency, "DEBIT_DONATION_IMPACT", -amountCents, {
        refType: "IMPACT",
        refId: `don:${Date.now()}`,
        memo: "Impact donation (in-app)"
    });

    await q(
        `UPDATE impact_pool SET pool_cents = pool_cents + $1, updated_at=now() WHERE currency=$2`,
        [amountCents, currency]
    );

    await q(
        `INSERT INTO impact_donations(user_id, currency, amount_cents, charity_id, ledger_entry_id)
     VALUES ($1,$2,$3,$4,$5)`,
        [userId, currency, amountCents, charityId || null, ledgerId]
    );

    return { ok: true };
}

export async function expireCredits() {
    const rows = await q<{ id: string; user_id: string; wallet_currency: Currency; amount_cents: string }>(
        `SELECT id, user_id, wallet_currency, amount_cents
     FROM ledger_entries
     WHERE status='POSTED'
       AND amount_cents > 0
       AND expires_at IS NOT NULL
       AND expires_at < now()
     LIMIT 500`
    );

    for (const r of rows) {
        await q(`UPDATE ledger_entries SET status='EXPIRED' WHERE id=$1 AND status='POSTED'`, [r.id]);
        await q(
            `UPDATE wallets SET balance_cents = balance_cents - $1, updated_at=now()
       WHERE user_id=$2 AND currency=$3`,
            [Number(r.amount_cents), r.user_id, r.wallet_currency]
        );
    }
    return { expired: rows.length };
}
