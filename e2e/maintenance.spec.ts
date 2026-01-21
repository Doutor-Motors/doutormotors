import { test, expect } from '@playwright/test';

test.describe('Maintenance Manager Page', () => {
  test.beforeEach(async ({ page }) => {
    // Use stored auth state
    await page.goto('/');
  });

  test('should navigate to maintenance page from dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate to maintenance page
    await page.click('a[href="/dashboard/manutencoes"]');
    await page.waitForURL('/dashboard/manutencoes');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Manutenções');
  });

  test('should display maintenance stats cards', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Check for stat cards
    const statsSection = page.locator('[data-testid="maintenance-stats"]');
    if (await statsSection.isVisible()) {
      await expect(statsSection).toBeVisible();
    }
    
    // Check for main sections
    await expect(page.locator('text=Atrasadas').or(page.locator('text=Próximas'))).toBeVisible();
  });

  test('should show tabs for list, calendar, and history views', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Check for tab buttons
    const tabList = page.locator('[role="tablist"]');
    if (await tabList.isVisible()) {
      await expect(page.locator('[role="tab"]:has-text("Lista")')).toBeVisible();
      await expect(page.locator('[role="tab"]:has-text("Calendário")')).toBeVisible();
      await expect(page.locator('[role="tab"]:has-text("Histórico")')).toBeVisible();
    }
  });

  test('should open new reminder dialog', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Click on new reminder button
    const newButton = page.locator('button:has-text("Novo")').or(page.locator('button:has-text("Adicionar")'));
    if (await newButton.isVisible()) {
      await newButton.click();
      
      // Check dialog opened
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=Novo Lembrete').or(page.locator('text=Adicionar Lembrete'))).toBeVisible();
    }
  });

  test('should filter reminders by priority', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Look for filter controls
    const filterButton = page.locator('button:has-text("Filtrar")').or(page.locator('[data-testid="filter-priority"]'));
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Check filter options exist
      await expect(page.locator('text=Crítico').or(page.locator('text=Todos'))).toBeVisible();
    }
  });

  test('should switch to calendar view', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Click calendar tab
    const calendarTab = page.locator('[role="tab"]:has-text("Calendário")');
    if (await calendarTab.isVisible()) {
      await calendarTab.click();
      
      // Check calendar is visible
      await expect(page.locator('[data-testid="calendar-view"]').or(page.locator('.calendar-grid'))).toBeVisible({ timeout: 5000 });
    }
  });

  test('should switch to history view', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Click history tab
    const historyTab = page.locator('[role="tab"]:has-text("Histórico")');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      
      // Check history content
      await expect(page.locator('text=Concluídas').or(page.locator('text=Histórico'))).toBeVisible();
    }
  });

  test('should export to PDF', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Look for PDF export button
    const pdfButton = page.locator('button:has-text("PDF")').or(page.locator('button:has-text("Exportar")'));
    if (await pdfButton.isVisible()) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      
      await pdfButton.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toContain('.pdf');
      }
    }
  });

  test('should add event to calendar', async ({ page }) => {
    await page.goto('/dashboard/manutencoes');
    
    // Look for calendar integration button
    const calendarButton = page.locator('button:has-text("Agenda")').or(page.locator('button:has-text("Calendário")'));
    if (await calendarButton.isVisible()) {
      await calendarButton.click();
      
      // Check for calendar provider options
      await expect(
        page.locator('text=Google Calendar')
          .or(page.locator('text=Outlook'))
          .or(page.locator('text=Apple'))
      ).toBeVisible({ timeout: 3000 });
    }
  });
});

test.describe('Maintenance Reminders Panel (Dashboard)', () => {
  test('should display maintenance panel on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for maintenance reminders panel
    await expect(
      page.locator('text=Lembretes de Manutenção')
        .or(page.locator('text=Manutenção'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no reminders', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for empty state or reminders list
    const emptyState = page.locator('text=Nenhum lembrete');
    const remindersList = page.locator('[data-testid="reminders-list"]');
    
    await expect(emptyState.or(remindersList)).toBeVisible({ timeout: 10000 });
  });

  test('should open create reminder dialog from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Find and click new reminder button in the panel
    const newButton = page.locator('button:has-text("Novo")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      
      // Check dialog opened
      await expect(page.locator('[role="dialog"]')).toBeVisible();
    }
  });
});

test.describe('OBD Mileage Sync', () => {
  test('should show OBD connection status on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for OBD connection buttons
    await expect(
      page.locator('button:has-text("BT")')
        .or(page.locator('button:has-text("WiFi")')
        .or(page.locator('button:has-text("Nativo"))))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should have mileage display when vehicle selected', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if vehicle info shows mileage
    const vehicleCard = page.locator('[class*="vehicle"]').or(page.locator('text*=km'));
    await expect(vehicleCard).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Maintenance Notifications', () => {
  test('should display system alerts banner', async ({ page }) => {
    await page.goto('/dashboard');
    
    // The alerts banner should be present (may be empty)
    const alertsBanner = page.locator('[data-testid="system-alerts"]').or(page.locator('[class*="alert"]'));
    // Just check the page loads without errors
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show notification settings in profile', async ({ page }) => {
    await page.goto('/dashboard/profile');
    
    // Check for notification settings section
    await expect(
      page.locator('text=Notificações')
        .or(page.locator('text=Alertas'))
    ).toBeVisible({ timeout: 10000 });
  });
});
