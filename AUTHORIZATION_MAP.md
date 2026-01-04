# AUTHORIZATION MAP - Match-Auto 10x

## Authentication & Authorization Status

| Endpoint Group | Auth Type | Status | Risks |
|----------------|-----------|--------|-------|
| Global Middleware | `sentinelMiddleware` | **Active** | Only detects bots and sets generic security headers. No user identity verification. |
| User Actions (`/api/payments/*`, `/api/ai/*`) | Clerk (Intended) | **MISSING** | `protectRoute` middleware exists in `backend/src/middleware/auth.ts` but is NOT applied to any routes in `index.ts`. ANYONE can call these endpoints if they know the path. |
| Secret Endpoints (`/api/secret/*`) | None | **CRITICAL** | These routes expose sensitive data (reputation, pulse, heatmap) and have NO authorization layer applied. |
| Crypto Withdraw (`/api/secret/crypto/withdraw`) | Hardcoded Token | **HIGH RISK** | Checks `securityToken !== 'BUNKER_SECURE_AUTH_TOKEN'`. This is a clear security anti-pattern and easily spoofed if found in client code. |
| B2B Data (`/api/b2b/market-data`) | Header API Key | **LOW RISK** | Verifies `X-Match-B2B-Key`. Functional but relies on a single shared key. |

## Confirmed Vulnerabilities
1. **Unprotected Admin/Secret Routes**: Routes like `/api/secret/pulse` and `/api/secret/heatmap` are public.
2. **Missing JWT/Session Validation**: Clerk is integrated in the project but NOT enforced at the API level.
3. **CORS Over-permissiveness**: `origin: '*'` is used globally, allowing any domain to make credentialed requests to the API.
