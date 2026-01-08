
import type { MiddlewareHandler } from "hono";

function parseOrigins(raw?: string) {
    return new Set((raw || "").split(",").map(s => s.trim()).filter(Boolean));
}

const devDefaults = new Set([
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]);

export const corsAllowlist = (): MiddlewareHandler => {
    const allow = parseOrigins(process.env.CORS_ALLOW_ORIGINS);

    return async (c, next) => {
        const origin = c.req.header("origin");

        if (origin) {
            const isAllowed =
                allow.has(origin) ||
                (process.env.APP_ENV !== "production" && devDefaults.has(origin));

            if (isAllowed) {
                c.header("Access-Control-Allow-Origin", origin);
                c.header("Vary", "Origin");
                c.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
                c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-user-id");
                c.header("Access-Control-Max-Age", "86400");
            }
        }

        if (c.req.method === "OPTIONS") return c.body(null, 204);
        await next();
    };
};
