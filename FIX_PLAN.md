# FIX PLAN - Match-Auto 10x

## 1. FILES_TO_MODIFY

### `backend/src/index.ts`
- **Change**: Import and apply `protectRoute` middleware to sensitive endpoints.
- **Change**: Replace hardcoded `BUNKER_SECURE_AUTH_TOKEN` with `c.env.ADMIN_SECURITY_TOKEN`.
- **Change**: Tighten CORS configuration (allow specific domains only).
- **Change**: Add Zod validation to `/api/listings/search`, `/api/payments/create-intent`, and others.

### `backend/src/routes/listings.ts`
- **Change**: Implement `POST /` to allow car listing creation using `createListingSchema`.

### `backend/src/middleware/security.ts`
- **Change**: Add basic rate-limiting logic using KV if not fully present.

## 2. FILES_TO_CREATE

### `backend/src/schemas/api.ts`
- Move all Zod schemas to a central location for backend-wide use.

### `backend/src/services/secret/AntigravityAuth.ts`
- A utility to handle the specific "Empire" level authorizations beyond basic Clerk auth.

## 3. IMPACTO_EN_RIESGO

| Vulnerability | Before | After |
|---------------|--------|-------|
| Unprotected API | Critical (Open) | Low (JWT Enforced) |
| Hardcoded Credentials | High (Static) | Low (ENV + Vault) |
| Missing Validation | Medium (Unstable) | Low (Schema Guaranteed) |
| Data Scraping | Medium | Low (Rate Limit + Sentinel) |

---

## Ready for Execution?
I can start implementing the **Critical Fixes** (Auth Enforcement + Validation) immediately.
