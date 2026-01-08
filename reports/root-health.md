# Root Health Diagnostic
**Date:** Jan 8, 2026
**Root Check:** `C:\Match-auto-1` (Unclean)

## 🚨 Critical Architecture Issue: Nested Roots
The workspace contains multiple "top-level" projects fused together. This pollutes global searches, dependency installs, and tooling.

| Path | Detection | Risk | Recommendation |
| :--- | :--- | :--- | :--- |
| `world-assets-exchange/` | Full Repo (frontend/backend) | 🔴 **HIGH** (Zombie Code) | **ARCHIVE** or **SPLIT** |
| `_features_10x/` | Partial Source (src/services) | 🟠 **MED** (Duplication) | **MERGE** to `backend/src` or **ARCHIVE** |
| `match-auto-admin/` | Potential Admin Panel | 🟠 **MED** (Noise) | **ARCHIVE** to `apps/admin` |

## ✅ Canonical Root Definition
The "True Trinity" architecture resides strictly in:
1.  `backend/` (Node/Express/Hono)
2.  `frontend/` (Next.js 15)
3.  `shared/` (Types/Utils)
4.  `docker/` (Infra)
5.  `postgres/` (DB Init)

**Status:** The "Surgical" Feature Radar is currently configured to **ONLY** scan these canonical folders, ignoring the noisy neighbors.

## 🛠 Action Plan
1.  **Immediate:** Maintain `.radarignore` / script allowlist (DONE).
2.  **Short Term:** Move noisy folders to `_archive/` to physically remove them from view without deleting data.
3.  **Long Term:** Decide if `world-assets-exchange` should be a separate git submodule or fully deleted if its features are migrated.
