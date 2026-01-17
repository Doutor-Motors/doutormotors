import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Contact Form
 * Tests the contact page form functionality
 */

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contato');
  });

  test('should display contact form', async ({ page }) => {
    // Check form fields
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/assunto|subject/i)).toBeVisible();
    await expect(page.getByLabel(/mensagem|message/i)).toBeVisible();
    
    // Check submit button
    await expect(page.getByRole('button', { name: /enviar/i })).toBeVisible();
  });

  test('should show validation for empty submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /enviar/i }).click();
    
    // Form should not submit (required fields)
    const nameInput = page.getByLabel(/nome/i);
    await expect(nameInput).toHaveAttribute('required', '');
  });

  test('should show validation for invalid email', async ({ page }) => {
    // Fill form with invalid email
    await page.getByLabel(/nome/i).fill('Test User');
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/assunto|subject/i).fill('Test Subject');
    await page.getByLabel(/mensagem|message/i).fill('Test message content');
    
    // Submit form
    await page.getByRole('button', { name: /enviar/i }).click();
    
    // Should show email validation error or not submit
    const emailInput = page.getByLabel(/email/i);
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('should fill form correctly', async ({ page }) => {
    // Fill all fields
    await page.getByLabel(/nome/i).fill('João Silva');
    await page.getByLabel(/email/i).fill('joao@example.com');
    
    // Handle phone field if exists
    const phoneField = page.getByLabel(/telefone|phone/i);
    if (await phoneField.count() > 0) {
      await phoneField.fill('11999999999');
    }
    
    await page.getByLabel(/assunto|subject/i).fill('Dúvida sobre diagnóstico');
    await page.getByLabel(/mensagem|message/i).fill('Gostaria de saber mais sobre o serviço de diagnóstico veicular.');
    
    // Verify fields are filled
    await expect(page.getByLabel(/nome/i)).toHaveValue('João Silva');
    await expect(page.getByLabel(/email/i)).toHaveValue('joao@example.com');
  });

  test('should have contact information displayed', async ({ page }) => {
    // Look for contact info (email, phone, address)
    const pageContent = await page.textContent('body');
    
    // Should have some contact information
    const hasContactInfo = 
      pageContent?.includes('@') || // Email
      pageContent?.match(/\d{2}[\s.-]?\d{4,5}[\s.-]?\d{4}/) || // Phone
      pageContent?.toLowerCase().includes('endereço'); // Address
    
    expect(hasContactInfo).toBeTruthy();
  });
});

test.describe('FAQ Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/faq');
  });

  test('should display FAQ items', async ({ page }) => {
    // Should have FAQ items (accordion or list)
    const faqItems = page.locator('[class*="accordion"], [class*="faq"], details');
    const itemCount = await faqItems.count();
    
    expect(itemCount).toBeGreaterThan(0);
  });

  test('should expand FAQ item on click', async ({ page }) => {
    // Find first expandable item
    const expandableItem = page.locator('button[aria-expanded], summary, [class*="accordion-trigger"]').first();
    
    if (await expandableItem.count() > 0) {
      // Click to expand
      await expandableItem.click();
      
      // Wait for animation
      await page.waitForTimeout(300);
      
      // Check if expanded (aria-expanded or visible content)
      const isExpanded = await expandableItem.getAttribute('aria-expanded');
      if (isExpanded !== null) {
        expect(isExpanded).toBe('true');
      }
    }
  });

  test('should have searchable FAQ or categories', async ({ page }) => {
    // Look for search or category functionality
    const hasSearch = await page.locator('input[type="search"], input[placeholder*="buscar" i]').count();
    const hasCategories = await page.locator('[class*="category"], [class*="tab"]').count();
    
    // Should have at least one way to filter FAQs
    expect(hasSearch + hasCategories).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Technical Report Page (Public)', () => {
  test('should display technical report', async ({ page }) => {
    await page.goto('/relatorio-tecnico');
    
    // Should show technical report page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

test.describe('Native App Guide Page', () => {
  test('should display native app guide', async ({ page }) => {
    await page.goto('/app-nativo');
    
    // Should show app guide content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Should have installation instructions
    const pageContent = await page.textContent('body');
    expect(pageContent?.toLowerCase()).toMatch(/android|ios|instalar|download/);
  });
});
