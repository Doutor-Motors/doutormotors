import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Authentication Flow
 * Tests login, logout, and password recovery flows
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
  });

  test('should display login page correctly', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Check page elements
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
    
    // Check links
    await expect(page.getByRole('link', { name: /esqueceu.*senha/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /criar.*conta|cadastr/i })).toBeVisible();
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Should show validation feedback (form won't submit)
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/senha/i).fill('wrongpassword123');
    
    // Submit form
    await page.getByRole('button', { name: /entrar/i }).click();
    
    // Should show error message (wait for response)
    await expect(page.getByText(/inválid|incorret|erro/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/login');
    
    // Click signup link
    await page.getByRole('link', { name: /criar.*conta|cadastr/i }).click();
    
    // Should be on signup page
    await expect(page).toHaveURL(/signup/);
    await expect(page.getByRole('heading', { name: /criar.*conta|cadastr/i })).toBeVisible();
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password link
    await page.getByRole('link', { name: /esqueceu.*senha/i }).click();
    
    // Should be on forgot password page
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('signup page should have required fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Check form fields
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /criar.*conta|cadastrar/i })).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate through main pages', async ({ page }) => {
    // Landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/carcare|diagnóstico/i);
    
    // About page
    await page.goto('/sobre');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Services page
    await page.goto('/servicos');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // How it works page
    await page.goto('/como-funciona');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Contact page
    await page.goto('/contato');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // FAQ page
    await page.goto('/faq');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have working header navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check logo link
    const logo = header.getByRole('link').first();
    await expect(logo).toBeVisible();
  });

  test('should have working footer', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toBeVisible();
    
    // Check footer links exist
    await expect(footer.getByRole('link', { name: /termos/i })).toBeVisible();
    await expect(footer.getByRole('link', { name: /privacidade/i })).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    
    // Should show 404 content
    await expect(page.getByText(/404|não encontrad/i)).toBeVisible();
  });
});

test.describe('Landing Page', () => {
  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    // Check hero content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check CTA buttons
    const ctaButtons = page.getByRole('link', { name: /começar|diagnóstico|saiba/i });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should display services section', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to services section
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Wait for content to load
    await page.waitForTimeout(500);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Page should load correctly
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Mobile menu should be present (hamburger)
    const mobileMenuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();
    await expect(mobileMenuButton).toBeVisible();
  });
});

test.describe('Study Car Page (Public)', () => {
  test('should display study car page', async ({ page }) => {
    await page.goto('/estude-seu-carro');
    
    // Check page loads
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have search or category functionality', async ({ page }) => {
    await page.goto('/estude-seu-carro');
    
    // Look for search input or category cards
    const hasSearchOrCategories = await page.locator('input[type="search"], input[placeholder*="buscar" i], [class*="category"], [class*="card"]').count();
    expect(hasSearchOrCategories).toBeGreaterThan(0);
  });
});

test.describe('Legal Pages', () => {
  test('should display terms page', async ({ page }) => {
    await page.goto('/termos');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Should have legal content
    await expect(page.locator('main')).toContainText(/termo|uso|serviço/i);
  });

  test('should display privacy policy page', async ({ page }) => {
    await page.goto('/privacidade');
    
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Should have privacy content
    await expect(page.locator('main')).toContainText(/privacidade|dados|informaç/i);
  });
});

test.describe('Accessibility', () => {
  test('should have proper page structure', async ({ page }) => {
    await page.goto('/');
    
    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
    
    // Should have main landmark
    await expect(page.locator('main')).toBeVisible();
    
    // Should have navigation
    await expect(page.locator('nav, header')).toBeVisible();
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');
    
    // Get all images
    const images = page.locator('img');
    const count = await images.count();
    
    // Check each image has alt attribute
    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through the page
    await page.keyboard.press('Tab');
    
    // First focusable element should have focus
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load landing page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have JavaScript errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should have no critical errors
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });
});
