import { Context } from "hono";

export function rewardsEnabled() {
    return process.env.FEATURE_REWARDS === "1";
}

export function allowCountry(c: Context) {
    const allow = (process.env.REWARDS_COUNTRY_ALLOWLIST || "MX").split(",").map(s => s.trim());
    const country = (c.req.header("cf-ipcountry") || c.req.header("CF-IPCountry") || "XX").toUpperCase();
    return allow.includes(country);
}
