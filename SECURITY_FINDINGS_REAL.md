# SECURITY FINDINGS REAL - Match-Auto 10x

## Confirmed Vulnerabilities

| Severity | Category | Description | Location |
|----------|----------|-------------|----------|
| **CRITICAL** | Auth Bypass | `protectRoute` middleware is defined in `backend/src/middleware/auth.ts` but **never used** in `index.ts`. All endpoints are effectively public. | `backend/src/index.ts` |
| **HIGH** | Hardcoded Secret | Use of a hardcoded string `BUNKER_SECURE_AUTH_TOKEN` to authorize crypto withdrawals. | `backend/src/index.ts:136` |
| **HIGH** | Insecure CORS | `origin: '*'` with `credentials: true` allows any website to make authenticated requests to this API (CSRF risk if cookies were used). | `backend/src/index.ts:31` |
| **MEDIUM** | Input Validation | Missing Zod validation on critical endpoints like `/api/payments/create-intent` and `/api/secret/crypto/withdraw`. | `backend/src/index.ts` |
| **MEDIUM** | Information Leak | Honeypot routes (`/wp-admin`, `.env`) return `honeypotTrap` which might inadvertently reveal infrastructure details if not carefully implemented. | `backend/src/index.ts:92-94` |
| **MEDIUM** | Missing Timeouts | `fetch` calls in services don't use `AbortController`, potentially leading to worker resource exhaustion on slow upstream response. | `backend/src/services/**` |

## Code Evidence
1. **Unused Auth**: 
   ```typescript
   // backend/src/index.ts - No import or use of protectRoute
   // backend/src/middleware/auth.ts - protectRoute is exported but orphan
   ```
2. **Hardcoded Token**:
   ```typescript
   if (securityToken !== 'BUNKER_SECURE_AUTH_TOKEN') { ... } // index.ts:136
   ```

## Potential Risks
- **DDoS via AI/Payments**: Public endpoints that trigger expensive API calls (HuggingFace, Stripe) could be exploited to drain account credits or cause financial overhead.
- **Data Scraping**: While `sentinelMiddleware` blocks some bots, the lack of real auth makes it easy for sophisticated scrapers to rotate IPs/User-Agents and extract listings/market data.
