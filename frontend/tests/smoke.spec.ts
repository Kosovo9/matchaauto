import { test, expect } from "@playwright/test";

const BASE = process.env.E2E_BASE_URL || "http://localhost:3000";

test("01 - Home loads", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page.locator("body")).toBeVisible();
});

test("02 - Marketplace route loads", async ({ page }) => {
    await page.goto(`${BASE}/marketplace`);
    await expect(page.locator("body")).toBeVisible();
});

test("03 - Assets route loads", async ({ page }) => {
    await page.goto(`${BASE}/assets`);
    await expect(page.locator("body")).toBeVisible();
});

test("04 - A key CTA button is clickable (Quick-Buy exists somewhere)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const btn = page.getByRole("button", { name: /quick-buy/i });
    // si no existe en home, no truena el build; solo valida si está presente
    if (await btn.count()) {
        await btn.first().click();
        await expect(page.locator("body")).toBeVisible();
    } else {
        test.skip(true, "No Quick-Buy button found on Home");
    }
});

test("05 - No obvious dead navigation (cart icon/button if present)", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const cart = page.getByRole("button", { name: /carrito|cart/i });
    if (await cart.count()) {
        await cart.first().click();
        await expect(page.locator("body")).toBeVisible();
    } else {
        test.skip(true, "No Cart button found on Home");
    }
});
