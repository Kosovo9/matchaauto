# 🚀 MATCH-AUTO MANUAL DEPLOYMENT GUIDE

## 1. Backend (Already Deployed ✅)
YOUR BACKEND IS LIVE AT: https://match-auto-backend.neocwolf.workers.dev

- **Status**: Online
- **Region**: Global (Cloudflare Workers)
- **Currency**: MXN (Fixed)
- **Payment Gateway**: MercadoPago (Mexico)

## 2. Frontend (Cloudflare Pages)
Since the automated build tool (`next-on-pages`) encountered a Windows-specific environment error, you must perform a **Manual Upload** to Cloudflare Pages. This is the most reliable method right now.

### Step 1: Ensure Build Artifacts
Running `npm run build` in the `frontend` directory generates the `.next` folder.
For Cloudflare Pages "Standard" deployment, we typically use the output of `@cloudflare/next-on-pages`.
**Access your `frontend` folder and check if `.vercel/output/static` exists.**
If NOT, we will try one last compilation attempt or use the standard Next.js build.

### Step 2: Upload to Cloudflare Dashboard
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** -> **Create application** -> **Pages**.
3. Select **"Upload assets"**.
4. Project Name: `match-auto-frontend`
5. **Upload the Folder**:
   - If `.vercel/output/static` exists: Upload that folder.
   - If NOT, and you want a Static Export:
     1. Add `output: 'export'` to `frontend/next.config.js`.
     2. Run `npm run build`.
     3. Upload the `frontend/out` folder.

### Step 3: Environment Variables (In Cloudflare Dashboard)
Once uploaded, go to **Settings** -> **Environment variables** for your Pages project and add:
- `NEXT_PUBLIC_API_URL`: `https://match-auto-backend.neocwolf.workers.dev`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_test_Y2xlcmsuY29t`

## 3. Verification
After upload, your site will be live at `https://match-auto-frontend.pages.dev`.
Test the connection by ensuring the homepage loads and data is fetched from the backend (check Network tab for calls to `match-auto-backend.neocwolf.workers.dev`).
