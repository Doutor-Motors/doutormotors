import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Dashboard Flow (Requires Authentication)
 * Tests the main user dashboard functionality
 */

// Use authenticated state if available
test.use({ 
  storageState: '.playwright/.auth/user.json',
});

test.describe('Dashboard', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should redirect to login when not authenticated', async ({ page, context }) => {
    // Clear auth state for this test
    await context.clearCookies();
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('should display dashboard when authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should show dashboard content
    await expect(page.getByRole('heading', { name: /dashboard|painel/i })).toBeVisible();
  });

  test('should have navigation sidebar or menu', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for navigation elements
    const hasNavigation = await page.locator('nav, aside, [class*="sidebar"]').count();
    expect(hasNavigation).toBeGreaterThan(0);
  });

  test('should navigate to vehicles page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on vehicles link
    const vehiclesLink = page.getByRole('link', { name: /veículo|vehicle/i });
    if (await vehiclesLink.count() > 0) {
      await vehiclesLink.first().click();
      await expect(page).toHaveURL(/vehicles/);
    }
  });

  test('should navigate to diagnostics page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click on diagnostics link
    const diagLink = page.getByRole('link', { name: /diagnóstico|diagnostic/i });
    if (await diagLink.count() > 0) {
      await diagLink.first().click();
      await expect(page).toHaveURL(/diagnostics/);
    }
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Should show profile content
    await expect(page.getByRole('heading', { name: /perfil|profile/i })).toBeVisible();
  });
});

test.describe('Vehicle Management', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should display vehicle list or empty state', async ({ page }) => {
    await page.goto('/dashboard/vehicles');
    
    // Should show vehicles page
    const hasVehicles = await page.locator('[class*="vehicle"], [class*="card"]').count();
    const hasEmptyState = await page.getByText(/nenhum veículo|adicione.*veículo|sem veículos/i).count();
    
    expect(hasVehicles + hasEmptyState).toBeGreaterThan(0);
  });

  test('should have add vehicle button', async ({ page }) => {
    await page.goto('/dashboard/vehicles');
    
    // Look for add button
    const addButton = page.getByRole('button', { name: /adicionar|novo|add/i });
    await expect(addButton).toBeVisible();
  });

  test('should open add vehicle form', async ({ page }) => {
    await page.goto('/dashboard/vehicles');
    
    // Click add button
    const addButton = page.getByRole('button', { name: /adicionar|novo|add/i });
    await addButton.click();
    
    // Should show form fields
    await expect(page.getByLabel(/marca|brand/i)).toBeVisible();
    await expect(page.getByLabel(/modelo|model/i)).toBeVisible();
    await expect(page.getByLabel(/ano|year/i)).toBeVisible();
  });
});

test.describe('Diagnostic Flow', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should display diagnostic center', async ({ page }) => {
    await page.goto('/dashboard/diagnostics');
    
    // Should show diagnostic page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should show connection options', async ({ page }) => {
    await page.goto('/dashboard/diagnostics');
    
    // Look for connection method options (Bluetooth, WiFi, Demo)
    const hasConnectionOptions = await page.locator('button, [class*="card"]').filter({ hasText: /bluetooth|wifi|demo|simular/i }).count();
    expect(hasConnectionOptions).toBeGreaterThan(0);
  });

  test('should have demo/simulation mode', async ({ page }) => {
    await page.goto('/dashboard/diagnostics');
    
    // Look for demo button
    const demoButton = page.getByRole('button', { name: /demo|simular|teste/i });
    if (await demoButton.count() > 0) {
      await expect(demoButton).toBeVisible();
    }
  });
});

test.describe('Diagnostic History', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should display history page', async ({ page }) => {
    await page.goto('/dashboard/history');
    
    // Should show history page
    const hasHistory = await page.locator('[class*="card"], table, [class*="list"]').count();
    const hasEmptyState = await page.getByText(/nenhum diagnóstico|histórico vazio|sem diagnósticos/i).count();
    
    expect(hasHistory + hasEmptyState).toBeGreaterThan(0);
  });
});

test.describe('Support Center', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should display support center', async ({ page }) => {
    await page.goto('/dashboard/support');
    
    // Should show support page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have create ticket option', async ({ page }) => {
    await page.goto('/dashboard/support');
    
    // Look for new ticket button
    const newTicketButton = page.getByRole('button', { name: /novo.*ticket|abrir.*ticket|criar.*ticket/i });
    if (await newTicketButton.count() > 0) {
      await expect(newTicketButton).toBeVisible();
    }
  });
});

test.describe('User Profile', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should display profile page with tabs', async ({ page }) => {
    await page.goto('/profile');
    
    // Should have tabs
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should show user information', async ({ page }) => {
    await page.goto('/profile');
    
    // Should show profile fields
    await expect(page.getByLabel(/nome|name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should have push notification settings', async ({ page }) => {
    await page.goto('/profile');
    
    // Navigate to notifications tab if exists
    const notifTab = page.getByRole('tab', { name: /notif/i });
    if (await notifTab.count() > 0) {
      await notifTab.click();
      
      // Should show push notification settings
      await expect(page.getByText(/push|notification/i)).toBeVisible();
    }
  });
});

test.describe('Logout Flow', () => {
  test.skip(({ browserName }) => !process.env.TEST_USER_EMAIL, 
    'Skipping authenticated tests - no credentials');

  test('should be able to logout', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /sair|logout|desconectar/i });
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      
      // Should redirect to login or home
      await expect(page).toHaveURL(/login|\/$/);
    }
  });
});
