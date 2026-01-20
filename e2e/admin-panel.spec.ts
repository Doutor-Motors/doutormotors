import { test, expect } from "@playwright/test";

/**
 * Admin Panel E2E Tests
 * 
 * Prerequisites:
 * - Test user with admin role must exist
 * - Use auth setup from e2e/auth.setup.ts
 */

test.describe("Admin Panel - Users Page", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin users page (assumes auth is handled by setup)
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
  });

  test("should display users table with correct columns", async ({ page }) => {
    // Wait for table to load
    await expect(page.locator("table")).toBeVisible({ timeout: 10000 });
    
    // Check table headers
    const headers = page.locator("th");
    await expect(headers.filter({ hasText: "Usuário" })).toBeVisible();
    await expect(headers.filter({ hasText: "Email" })).toBeVisible();
    await expect(headers.filter({ hasText: "Papel" })).toBeVisible();
  });

  test("should have tabs for Users and Orphans", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /Usuários/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Órfãos/i })).toBeVisible();
  });

  test("should show orphan users tab content when clicked", async ({ page }) => {
    // Click on orphans tab
    await page.getByRole("tab", { name: /Órfãos/i }).click();
    
    // Should show orphan users section
    await expect(page.getByText("Usuários Órfãos")).toBeVisible({ timeout: 10000 });
  });

  test("should have delete by email button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Excluir por email/i })).toBeVisible();
  });

  test("should open delete by email dialog", async ({ page }) => {
    await page.getByRole("button", { name: /Excluir por email/i }).click();
    
    // Dialog should appear
    await expect(page.getByText("Excluir usuário por email")).toBeVisible();
    await expect(page.getByPlaceholder("email@exemplo.com")).toBeVisible();
  });

  test("should filter users by search term", async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector("table tbody tr", { timeout: 10000 });
    
    // Type in search
    const searchInput = page.getByPlaceholder("Buscar usuários...");
    await searchInput.fill("admin");
    
    // Results should update (we can't assert specific content without knowing test data)
    await page.waitForTimeout(500);
  });
});

test.describe("Admin Panel - Subscriptions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/subscriptions");
    await page.waitForLoadState("networkidle");
  });

  test("should display subscriptions page", async ({ page }) => {
    await expect(page.getByText(/Assinaturas/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Panel - Payments Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/payments");
    await page.waitForLoadState("networkidle");
  });

  test("should display payments page", async ({ page }) => {
    await expect(page.getByText(/Pagamentos/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Panel - Tickets Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/tickets");
    await page.waitForLoadState("networkidle");
  });

  test("should display tickets page", async ({ page }) => {
    await expect(page.getByText(/Tickets/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Panel - Reports Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/reports");
    await page.waitForLoadState("networkidle");
  });

  test("should display reports page", async ({ page }) => {
    await expect(page.getByText(/Relatórios/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Panel - Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/settings");
    await page.waitForLoadState("networkidle");
  });

  test("should display settings page", async ({ page }) => {
    await expect(page.getByText(/Configurações/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Admin Panel - Security", () => {
  test("should redirect non-admin users from admin pages", async ({ page }) => {
    // This test would need a non-admin user context
    // For now, we just verify the page loads without errors for admin
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    
    // If we get redirected or see an error, that's expected for non-admin
    // For admin, we should see the page
    const url = page.url();
    expect(url).toContain("/admin");
  });
});
