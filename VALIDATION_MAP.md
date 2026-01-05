# VALIDATION MAP - Match-Auto 10x

## Input Validation Status

| Endpoint | Validation Method | Risk Level | Evidence / Notes |
|----------|-------------------|------------|------------------|
| `/api/listings/search` | None | **High** | Uses `c.req.query()` directly without Zod/manual check. Potential for SQLi (if query builder used unsafely). |
| `/api/payments/create-intent` | Manual Destructuring | **Medium** | Destructures `planId, userId, userEmail`. No type/length checks. |
| `/api/ai/moderate` | Manual Destructuring | **Medium** | Destructures `text`. No validation. |
| `/api/chat/ws/:roomId` | URL Param | **Low** | Uses `roomId` from URL. |
| `/api/secret/crawl` | Catch-all JSON | **Medium** | `c.req.json().catch(() => ({ isTurbo: false }))`. No shape validation. |
| `/api/secret/notification` | Default Value | **Low** | `userId || 'anon'`. |
| `/api/secret/crypto/withdraw` | Manual Destructuring | **High** | Destructures `address, amount`. No validation on Solana address format or amount range. |
| `/api/secret/crypto/balance` | Default Value | **Low** | `address || 'default'`. |
| `/api/test/negotiate` | Manual Destructuring | **Medium** | Destructures `offer, askingPrice`. |
| `/api/b2b/market-data` | API Key Check | **Low** | Only checks existence of `X-Match-B2B-Key`. |
| `/api/b2b/normalize` | Manual Destructuring | **Medium** | Destructures `price`. |
| `/listings/:id` | URL Param | **Low** | No explicit schema validation shown in file. |

## Schemas Defined but Unused in Routes
- `createListingSchema` in `backend/src/routes/listings.ts`: Comprehensive Zod schema for car listings, but NO POST route is currently implemented to use it.
