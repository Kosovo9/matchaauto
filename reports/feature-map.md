# Feature Map: Used vs. Hidden (80% Zombie)

**Status:** Generated from Surgical Radar Scan
**Scope:** Canonical Root ONLY (`backend`, `frontend`, `shared`, `docker`)

## 💎 P0: Monetization & Security (Wire these NOW)

| Feature ID | Evidence (SQL/Code) | Status | Next Wiring Step |
| :--- | :--- | :--- | :--- |
| **security.idVerify** | `identity_verifications` (Table) | 🔴 **ZOMBIE** | 1. Create `VerificationService`. <br> 2. Expose `POST /verify/request`. <br> 3. Add `VerifiedBadge` to UI. |
| **security.honeypot** | `honeypot_hits` (Table) | 🔴 **ZOMBIE** | 1. Add middleware to catch bot traffic. <br> 2. Log triggers to DB. <br> 3. Block IPs > 5 hits. |
| **security.audit** | `security_audit_log` (Table) | 🔴 **ZOMBIE** | 1. Add `AuditLogger` class. <br> 2. Hook into `AuthService` (login/fail). |
| **assets.escrow** | `barter_escrows` (SQL Ref) | 🔴 **ZOMBIE** | 1. Implement `EscrowService`. <br> 2. API: `hold_funds`, `release_funds`. |
| **comm.messaging** | `messages` (Table exists, usage?) | 🟡 **STUB** | 1. Verify `ChatService` logic. <br> 2. Ensure Real-time (Socket/SSE) is active. |

## 🚀 P1: Growth & Retention

| Feature ID | Evidence | Status | Next Wiring Step |
| :--- | :--- | :--- | :--- |
| **search.saved** | `saved_searches` (Table) | 🔴 **ZOMBIE** | 1. UI: "Save this Search" button. <br> 2. Backend: Job to match new listings -> Email/Notif. |
| **ai.searchAnalytics**| `search_heatmaps` (Table) | 🔴 **ZOMBIE** | 1. Capture search params + LatLong. <br> 2. Aggregate heatmaps for Admin Dashboard. |
| **geo.optimization** | `spatial_grid_index` (Table) | 🔴 **ZOMBIE** | 1. Activate PostGIS Tiling. <br> 2. Optimize "Search in this area" queries. |

## 🔧 P2: Technical Moat

| Feature ID | Evidence | Status | Next Wiring Step |
| :--- | :--- | :--- | :--- |
| **geo.sync** | `update_listing_geom` (Func) | 🔴 **ZOMBIE** | 1. Add Trigger to `listings` table. <br> 2. Ensure Lat/Lng updates sync to `geom` column auto-magically. |
| **vehicles.trigger** | `vehicles_search_trigger` (Func)| 🔴 **ZOMBIE** | 1. Re-verify if needed or legacy. <br> 2. If valid, attach to `vehicles` table update. |

## ⚠️ Data Model Risks
- **Duplication Risk:** `marketplace_items` vs `listings`.
  - *Recommendation:* Migrate distinct fields from `marketplace_items` to `listings` (jsonb) and drop `marketplace_items` to avoid split brain.

## 📊 Summary
- **Total Tables Detected:** 50
- **Unwired "Zombie" Tables:** 10 (20%)
- **Conclusion:** The database schema is significantly ahead of the application code. Approximately **20-30% of "Hard Value" features** (Security, Escrow, Analytics) are ready in the DB but unreachable by users.
