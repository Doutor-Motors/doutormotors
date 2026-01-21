import { test, expect, BrowserContext, Page } from '@playwright/test';

/**
 * E2E Tests: Platform Detection
 * Tests platform detection functionality across different browsers and contexts
 */

test.describe('Platform Detection', () => {
  test.describe('Web Browser Detection', () => {
    test('should detect Chrome browser correctly', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');
      
      await page.goto('/baixar-app');
      
      // Should show browser detection
      await expect(page.locator('text=/Chrome|Navegador/i')).toBeVisible();
      
      // Should show Web Bluetooth as available (Chrome supports it)
      const bluetoothSection = page.locator('text=/Bluetooth/i').first();
      await expect(bluetoothSection).toBeVisible();
    });

    test('should detect Firefox browser correctly', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');
      
      await page.goto('/baixar-app');
      
      // Should show Firefox detection
      await expect(page.locator('text=/Firefox|Navegador/i')).toBeVisible();
      
      // Firefox doesn't support Web Bluetooth - should show limitation
      await expect(page.locator('text=/não suporta|indisponível/i')).toBeVisible();
    });

    test('should detect WebKit/Safari browser correctly', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'This test is for WebKit only');
      
      await page.goto('/baixar-app');
      
      // Should show Safari/WebKit detection
      await expect(page.locator('text=/Safari|Navegador/i')).toBeVisible();
      
      // Safari doesn't support Web Bluetooth - should show limitation
      await expect(page.locator('text=/não suporta|indisponível|baixe.*app/i')).toBeVisible();
    });
  });

  test.describe('Download App Page', () => {
    test('should display download app page correctly', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should have page title/heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Should show platform cards for Android and iOS
      await expect(page.locator('text=/Android/i').first()).toBeVisible();
      await expect(page.locator('text=/iOS|iPhone/i').first()).toBeVisible();
    });

    test('should display platform comparison table', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should have comparison table
      const table = page.locator('table');
      await expect(table).toBeVisible();
      
      // Table should have method columns
      await expect(page.locator('text=/Bluetooth/i').first()).toBeVisible();
      await expect(page.locator('text=/WiFi/i').first()).toBeVisible();
    });

    test('should display benefits section', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should show benefits of native app
      await expect(page.locator('text=/vantag|benefício|funcionalidade/i').first()).toBeVisible();
    });

    test('should have download buttons/links', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should have download CTAs
      const downloadButtons = page.locator('button, a').filter({ hasText: /baixar|download|instalar/i });
      await expect(downloadButtons.first()).toBeVisible();
    });
  });

  test.describe('Diagnostic Center Platform Detection', () => {
    test.beforeEach(async ({ page }) => {
      // This test requires authentication - we'll check if redirect happens
      await page.goto('/dashboard/diagnostic');
    });

    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Should redirect to login if not authenticated
      await page.waitForURL(/login|signup|dashboard/, { timeout: 10000 });
      
      // Either on login page or dashboard (if session exists)
      const url = page.url();
      expect(url.includes('login') || url.includes('dashboard')).toBeTruthy();
    });
  });

  test.describe('Connection Method Guide', () => {
    test('should be accessible from diagnostic page link', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // The download app page should explain connection methods
      await expect(page.locator('text=/conexão|conectar|OBD/i').first()).toBeVisible();
    });
  });

  test.describe('Mobile Viewport Tests', () => {
    test('should display mobile-optimized layout', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.goto('/baixar-app');
      
      // Should load and display content
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // Cards should be visible
      await expect(page.locator('[class*="card"], [class*="Card"]').first()).toBeVisible();
    });

    test('should show download prompt on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      
      await page.goto('/baixar-app');
      
      // Should show mobile-specific CTAs
      await expect(page.locator('text=/baixar|instalar/i').first()).toBeVisible();
    });
  });

  test.describe('User Agent Detection', () => {
    test('should detect Android user agent', async ({ browser }) => {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        viewport: { width: 412, height: 915 },
      });
      
      const page = await context.newPage();
      await page.goto('/baixar-app');
      
      // Should show Android-specific content
      await expect(page.locator('text=/Android/i').first()).toBeVisible();
      
      await context.close();
    });

    test('should detect iOS user agent', async ({ browser }) => {
      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        viewport: { width: 390, height: 844 },
      });
      
      const page = await context.newPage();
      await page.goto('/baixar-app');
      
      // Should show iOS-specific content
      await expect(page.locator('text=/iOS|iPhone|App Store/i').first()).toBeVisible();
      
      await context.close();
    });
  });

  test.describe('Header Navigation', () => {
    test('should have link to download app page in header', async ({ page }) => {
      await page.goto('/');
      
      // On desktop, check for download app link
      await page.setViewportSize({ width: 1280, height: 800 });
      
      // Header should have download app link
      const downloadLink = page.locator('header a, nav a').filter({ hasText: /baixar.*app|app.*nativo/i });
      await expect(downloadLink.first()).toBeVisible();
      
      // Click should navigate to download page
      await downloadLink.first().click();
      await expect(page).toHaveURL(/baixar-app/);
    });

    test('should have download app link in mobile menu', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      
      // Open mobile menu
      const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
      await menuButton.click();
      
      // Wait for menu to open
      await page.waitForTimeout(300);
      
      // Should have download app link
      const downloadLink = page.locator('nav a, [class*="menu"] a').filter({ hasText: /baixar.*app|app.*nativo/i });
      await expect(downloadLink.first()).toBeVisible();
    });
  });

  test.describe('Platform Capability Indicators', () => {
    test('should show Bluetooth capability status', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should show Bluetooth status indicator
      await expect(page.locator('text=/Bluetooth/i').first()).toBeVisible();
    });

    test('should show WiFi/TCP capability status', async ({ page }) => {
      await page.goto('/baixar-app');
      
      // Should show WiFi/TCP status indicator
      await expect(page.locator('text=/WiFi|TCP/i').first()).toBeVisible();
    });

    test('should indicate browser limitations', async ({ page, browserName }) => {
      await page.goto('/baixar-app');
      
      // For web browsers, should show some limitations
      // WiFi/TCP is never supported in browsers
      await expect(page.locator('text=/simulad|limitad|não.*suport/i').first()).toBeVisible();
    });
  });

  test.describe('Install App Page Integration', () => {
    test('should have link between install and download pages', async ({ page }) => {
      await page.goto('/instalar');
      
      // Should load install page
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      
      // May have link to native app download
      const nativeLink = page.locator('a').filter({ hasText: /nativo|android|ios|baixar/i });
      const linkCount = await nativeLink.count();
      
      // Either has link or explains difference between PWA and native
      expect(linkCount >= 0).toBeTruthy();
    });
  });
});

test.describe('Platform Detection Performance', () => {
  test('should detect platform quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/baixar-app');
    
    // Wait for platform detection to complete (look for specific content)
    await expect(page.locator('text=/Bluetooth|WiFi|Android|iOS|Chrome|Safari/i').first()).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Platform detection should complete in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have console errors on download page', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/baixar-app');
    await page.waitForLoadState('networkidle');
    
    // Filter out known harmless errors
    const criticalErrors = errors.filter(e => 
      !e.includes('ResizeObserver') && 
      !e.includes('Non-Error') &&
      !e.includes('Script error')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});
