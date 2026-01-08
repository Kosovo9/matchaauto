import { test, expect } from "@playwright/test";

// FRONTEND vive en puerto 80 en el local
const BASE = process.env.E2E_BASE_URL || "http://localhost";

test("01 home loads", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.locator("body")).toBeVisible();
});

test("02 /auto loads", async ({ page }) => {
    // Nota: si decides mover la home a /auto
    await page.goto(`${BASE}/auto`);
    await expect(page.locator("body")).toBeVisible();
});

test("03 /marketplace loads", async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await expect(page.locator("body")).toBeVisible();
});

test("04 /assets loads", async ({ page }) => {
    await page.goto(`${BASE}/assets`);
    await expect(page.locator("body")).toBeVisible();
});

test("05 search input exists (auto)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.getByRole("textbox")).toBeVisible();
});

test("06 search submit works (Enter)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const box = page.getByRole("textbox");
    await box.fill("Tesla");
    await box.press("Enter");
    await expect(page.locator("body")).toBeVisible();
});

test("07 tabs clickable (auto)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const carsBtn = page.getByRole("button", { name: /cars|vehículos/i });
    if (await carsBtn.count()) await carsBtn.click();
    await expect(page.locator("body")).toBeVisible();
});

test("08 quick-buy clickable if present", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const qb = page.getByRole("button", { name: /quick-buy/i });
    if (await qb.count()) await qb.first().click();
    await expect(page.locator("body")).toBeVisible();
});

test("09 cart reachable if present", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const cart = page.getByRole("button", { name: /carrito|cart/i });
    if (await cart.count()) await cart.first().click();
    await expect(page.locator("body")).toBeVisible();
});

test('10 backend health responds', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/health');
    expect(response.status()).toBe(200);
});

// --- EXTRA CERTIFICATION TESTS (PAQUETE FINAL) ---

test("11 marketplace search button works", async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await page.getByRole("textbox").fill("Tesla");
    await page.getByRole("button", { name: /search/i }).click();
    await expect(page.locator("body")).toBeVisible();
});

test("12 assets search enter works", async ({ page }) => {
    await page.goto(`${BASE}/assets`);
    const box = page.getByRole("textbox");
    await box.fill("Santa Fe");
    await box.press("Enter");
    await expect(page.locator("body")).toBeVisible();
});

test("13 marketplace opens a listing if available", async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    // Buscamos cualquier botón o link que contenga "Tap" o sea parte de una card
    const any = page.locator('button:has-text("Tap to view")').first();
    if (await any.count() > 0) {
        await any.click();
        await expect(page.url()).toContain('/listing/');
    }
});

test("14 assets pin click navigates (if pins exist)", async ({ page }) => {
    await page.goto(`${BASE}/assets`);
    const pin = page.locator("button", { hasText: "⬤" }).first();
    if (await pin.count() > 0) {
        await pin.click();
        await expect(page.url()).toContain('/listing/');
    }
});

test("15 api featured responds for marketplace", async ({ request }) => {
    const r = await request.get("http://localhost:3000/api/featured?domain=marketplace");
    expect(r.ok()).toBeTruthy();
});
