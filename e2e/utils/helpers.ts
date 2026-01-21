import { Page, expect } from '@playwright/test';

/**
 * E2E Test Utilities
 * Common helper functions for Playwright tests
 */

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Fill login form and submit
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 15000 });
}

/**
 * Navigate to dashboard section
 */
export async function navigateToDashboard(page: Page, section: string): Promise<void> {
  await page.goto(`/dashboard/${section}`);
  await waitForPageLoad(page);
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector);
  const box = await element.boundingBox();
  if (!box) return false;
  
  const viewport = page.viewportSize();
  if (!viewport) return false;
  
  return (
    box.x >= 0 &&
    box.y >= 0 &&
    box.x + box.width <= viewport.width &&
    box.y + box.height <= viewport.height
  );
}

/**
 * Take screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `screenshots/${name}-${timestamp}.png` });
}

/**
 * Check for console errors
 */
export async function checkNoConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });
  
  return errors;
}

/**
 * Mock API response
 */
export async function mockApiResponse(
  page: Page, 
  url: string | RegExp, 
  response: unknown
): Promise<void> {
  await page.route(url, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, text?: string | RegExp): Promise<void> {
  const toastSelector = '[class*="toast"], [class*="sonner"], [role="alert"]';
  
  if (text) {
    await expect(page.locator(toastSelector).filter({ hasText: text })).toBeVisible();
  } else {
    await expect(page.locator(toastSelector)).toBeVisible();
  }
}

/**
 * Close all toasts
 */
export async function closeAllToasts(page: Page): Promise<void> {
  const closeButtons = page.locator('[class*="toast"] button[aria-label*="close" i], [class*="toast"] button:has(svg)');
  const count = await closeButtons.count();
  
  for (let i = 0; i < count; i++) {
    await closeButtons.nth(i).click();
  }
}

/**
 * Scroll to bottom of page
 */
export async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
}

/**
 * Scroll to top of page
 */
export async function scrollToTop(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

/**
 * Check if dark mode is active
 */
export async function isDarkMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains('dark') ||
           document.body.classList.contains('dark');
  });
}

/**
 * Toggle dark mode
 */
export async function toggleDarkMode(page: Page): Promise<void> {
  const themeToggle = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i]');
  if (await themeToggle.count() > 0) {
    await themeToggle.first().click();
  }
}

/**
 * Get current URL path
 */
export async function getCurrentPath(page: Page): Promise<string> {
  const url = new URL(page.url());
  return url.pathname;
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.waitForURL(urlPattern, { timeout: 10000 });
}

/**
 * Fill vehicle form
 */
export async function fillVehicleForm(
  page: Page, 
  data: { brand: string; model: string; year: string; plate?: string }
): Promise<void> {
  await page.getByLabel(/marca|brand/i).fill(data.brand);
  await page.getByLabel(/modelo|model/i).fill(data.model);
  await page.getByLabel(/ano|year/i).fill(data.year);
  
  if (data.plate) {
    const plateField = page.getByLabel(/placa|plate/i);
    if (await plateField.count() > 0) {
      await plateField.fill(data.plate);
    }
  }
}

/**
 * Check accessibility basics
 */
export async function checkBasicAccessibility(page: Page): Promise<{
  hasH1: boolean;
  hasMain: boolean;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
}> {
  const h1Count = await page.locator('h1').count();
  const mainCount = await page.locator('main').count();
  
  const images = page.locator('img');
  const imageCount = await images.count();
  let imagesWithAlt = 0;
  
  for (let i = 0; i < imageCount; i++) {
    const alt = await images.nth(i).getAttribute('alt');
    if (alt !== null) imagesWithAlt++;
  }
  
  return {
    hasH1: h1Count === 1,
    hasMain: mainCount >= 1,
    imagesWithAlt,
    imagesWithoutAlt: imageCount - imagesWithAlt,
  };
}
