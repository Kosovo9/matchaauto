# 🗺️ Unified Feature Map: Match-Auto Trinity (1000X)

## 🏎️ AUTO DOMAIN
| Feature ID | State | Flag Name | Priority | Next Wiring Step |
| :--- | :--- | :--- | :--- | :--- |
| `auto.quickbuy` | **STABLE** | `auto.quickbuy` | P0 | Integrated with Checkout. |
| `auto.vin_decoder` | **STUB** | `auto.vin_decoder` | P1 | Connect `vin-decoder.controller.ts` to `/vin-decoder` page. |
| `auto.360_view` | **BETA** | `auto.360_view` | P1 | Wire `HyperViewer.tsx` to display real 360 sequences. |
| `auto.tracking` | **BETA** | `auto.tracking` | P2 | Connect `vehicle-tracking.controller.ts` to Dashboard. |

## 🛍️ MARKETPLACE DOMAIN
| Feature ID | State | Flag Name | Priority | Next Wiring Step |
| :--- | :--- | :--- | :--- | :--- |
| `market.masonry` | **STABLE** | `market.masonry` | P0 | Live in `/marketplace`. |
| `market.infinite` | **STABLE** | `market.infinite` | P0 | Live with `useInfiniteMarketplace`. |
| `market.cart` | **STABLE** | `market.cart` | P0 | Buttons connected to `actions.cart`. |
| `market.verify` | **STUB** | `market.verification` | P1 | Link "Verified Item" badge to seller status DB. |

## 🏰 ASSETS DOMAIN
| Feature ID | State | Flag Name | Priority | Next Wiring Step |
| :--- | :--- | :--- | :--- | :--- |
| `assets.maps` | **BETA** | `assets.maps` | P0 | MapLibre view active; optimize vector tiles. |
| `assets.geosearch` | **BETA** | `assets.geosearch` | P0 | Connected to RAG + Geocoder mock. |
| `assets.escrow` | **FLAGGED** | `assets.escrow` | P0 | Wire `barter_escrows` table to `/escrow/verify` endpoint. |
| `assets.vr_tours` | **FLAGGED** | `assets.vr_tours` | P2 | Integrate A-Frame in `HyperViewer.tsx`. |

## 🌌 COMMON / SHARED (The "Nexus")
| Feature ID | State | Flag Name | Priority | Next Wiring Step |
| :--- | :--- | :--- | :--- | :--- |
| `rag.search` | **BETA** | `ai.rag_search` | P0 | Score tuning (Semantic vs Geo weights). |
| `ai.moderation` | **FLAGGED** | `ai.moderation` | P1 | Implement `moderation.service.ts` in listing creation flow. |
| `comm.messaging` | **FLAGGED** | `comm.messaging` | P1 | Connect `QuantumChat` to `messaging` DB table. |
| `ads.boost` | **FLAGGED** | `ads.boost` | P0 | Complete `AdsModule.ts` integration in seller dashboard. |

## 🧟 Dormant Features (SQL Zombies)
Detected items in DB schema with NO code wiring:
- **Search Heatmaps:** Table `search_heatmaps` exists. Proposed: `ai.search_analytics`.
- **Identity Verification:** Table `identity_verifications` exists. Proposed: `security.id_verify`.
- **Security Audit:** Table `security_audit_log` exists. Proposed: `admin.audit_log`.

---
*Status: BETA - Ready for Phase 2 implementation.*
