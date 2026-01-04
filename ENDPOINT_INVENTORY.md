# ENDPOINT INVENTORY - Match-Auto 10x

## Backend (Hono - Cloudflare Workers)

### Core Endpoints (`backend/src/index.ts`)
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/` | Anonymous | Healthcheck & Status |
| GET | `/api/listings/search` | `EdgeCacheSupercharger` | Stratified Cache Search |
| POST | `/api/payments/create-intent` | `PaymentOrchestrator` | Create Stripe Payment Intent |
| POST | `/api/ai/moderate` | `AIOrchestrator` | AI Content Moderation |
| GET | `/api/chat/ws/:roomId` | `ChatRoom` (Durable Object) | WebSocket Chat Connection |
| GET | `/wp-admin` | `honeypotTrap` | Honeypot for scrapers |
| GET | `/.env` | `honeypotTrap` | Honeypot for scrapers |
| GET | `/config.php` | `honeypotTrap` | Honeypot for scrapers |
| GET | `/api/secret/pulse` | `PulseEngine` | Global event tracking |
| GET | `/api/secret/heatmap` | `HeatmapGenerator` | Market heatmap data |
| POST | `/api/secret/crawl` | `HyperCrawler` | Enqueue Turbo Crawl |
| GET | `/api/secret/notification` | `DopamineEngine` | Irresistible notifications |
| POST | `/api/secret/crypto/withdraw` | `AntigravityCryptoWallet` | Solana payout (hardcoded auth) |
| GET | `/api/secret/crypto/balance` | `AntigravityCryptoWallet` | Get Solana wallet balance |
| POST | `/api/test/negotiate` | `GhostNegotiator` | AI Offer filtering |
| GET | `/api/secret/reputation/:userId` | `OnChainReputation` | User reputation via intelligence |

### B2B Routes (`backend/src/routes/b2b.ts`)
*Base Path: `/api/b2b`*
| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/market-data` | Anonymous | B2B Market pulse (API Key required) |
| POST | `/normalize` | `GlobalPriceNormalizer` | Normalize car prices |

### Listings Routes (`backend/src/routes/listings.ts`)
*Base Path: `/listings`*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id` | Fetch specific car listing details |

### Viral Routes (`backend/src/routes/viral.ts`)
*Base Path: `/viral`*
| Method | Path | Description |
|--------|------|-------------|
| GET | `/metrics` | Fetch viral performance metrics |

## Frontend (Next.js App Router)
*Note: No dedicated API routes found in `src/app/api`. Navigation is client-side or SSR via `src/app/page.tsx`.*
