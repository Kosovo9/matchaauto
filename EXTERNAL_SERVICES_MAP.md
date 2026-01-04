# EXTERNAL SERVICES MAP - Match-Auto 10x

## Integration Details

| Service | Purpose | File(s) | Secret Source |
|---------|---------|---------|---------------|
| **Stripe** | Payment processing (create intents, customer sync) | `backend/src/services/payments/engine.ts` | `env.STRIPE_SECRET_KEY` |
| **Hugging Face** | AI content moderation (TOXIC-BERT) | `backend/src/services/ai/engine.ts` | `env.HF_TOKEN` |
| **Clerk** | Authentication (Intended) | `backend/src/middleware/auth.ts` | Clerk ENV vars |
| **Solana** | Commission distribution & balance tracking | `backend/src/services/secret/CryptoWallet.ts` | Hardcoded logic / Simulated |
| **MercadoPago** | Payment processing (Placeholder/V1) | `backend/src/services/payments/engine.ts` | `env.MP_ACCESS_TOKEN` |
| **Cloudflare D1** | SQL Database | `backend/src/index.ts` | `env.DB` |
| **Cloudflare KV** | Data persistence/Viral Metrics | `backend/src/index.ts`, `backend/src/middleware/security.ts` | `env.VIRAL_DATA` |
| **Durable Objects** | Real-time Chat | `backend/src/chat/durable.ts` | `env.CHAT_ROOM` |

## Resilience Check
- **Error Handling**: `createPaymentIntent` and `moderateText` use `try/catch` and return safe defaults or error objects.
- **Secrets Management**: Most secrets are correctly accessed via `c.env` or `env` passed to constructors.
- **Timeouts**: No explicit `AbortController` or timeouts found in `fetch` calls (potential for hanging workers if external APIs fail slow).
- **Hardcoding**: High-risk hardcoded 'Security Token' found in `index.ts` for crypto withdrawals.
