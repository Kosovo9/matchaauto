# 🚀 DeepSeek Code Generation Instructions - Trinity Diamond
**Context:** MIT Senior Engineer Architecture | **Goal:** Implement Mandatory Features

## 1. F-IMG-ZOOM (Amazon-like Gallery)
- **Frontend:** Create `components/shared/MediaGallery.tsx`.
- **Logic:** Implement hover/click zoom, mobile pinch-to-zoom, and lightbox.
- **Support:** HD Images + MP4/WebM Video.
- **Registry:** Wire to `media.imageZoom` flag.

## 2. F-GEO-NEARBY (Fuzzy Privacy Search)
- **Backend:** Implement `/api/geo/search` in Hono.
- **Logic:** Use PostGIS `ST_DWithin`. Apply 500m grid for "fuzzy location" privacy.
- **Frontend:** Integrate MapLibre with cluster support and sync list.
- **Registry:** Wire to `media.geoNearby` flag.

## 3. F-AR-PASS (360/3D/AR)
- **Backend:** Create `GET /api/listings/:id/media` returning `model3d_glb_url` and `tour360_url`.
- **Frontend:** 
  - `Viewer360.tsx`: WebGL equirectangular viewer.
  - `Viewer3D.tsx`: Three.js GLB loader.
  - `ARButton.tsx`: WebXR `immersive-ar` session gating.
- **Registry:** Wire to `media.arPass` flag.

## 4. Wiring Instructions
- **Actions:** Update `frontend/src/actions.ts` to include new API calls.
- **API Client:** Ensure `apiClient.ts` handles multi-domain headers (Auto/Market/Assets).
- **DB:** Ensure `pgvector` and `PostGIS` extensions are active in migrations.
