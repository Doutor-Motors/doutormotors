import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../.playwright/.auth/user.json');

/**
 * Authentication Setup
 * This runs before all tests that depend on the 'setup' project
 * and saves the authenticated state for reuse
 */
setup('authenticate', async ({ page }) => {
  // Skip authentication in CI or when credentials are not available
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;
  
  if (!testEmail || !testPassword) {
    console.log('Skipping auth setup - no test credentials provided');
    console.log('Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables to enable authenticated tests');
    
    // Save empty auth state
    await page.context().storageState({ path: authFile });
    return;
  }

  // Navigate to login page
  await page.goto('/login');
  
  // Wait for the page to load
  await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();

  // Fill in login form
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByLabel(/senha/i).fill(testPassword);
  
  // Submit form
  await page.getByRole('button', { name: /entrar/i }).click();

  // Wait for redirect to dashboard (indicates successful login)
  await page.waitForURL(/dashboard/, { timeout: 15000 });
  
  // Verify we're logged in
  await expect(page).toHaveURL(/dashboard/);

  // Save the authentication state
  await page.context().storageState({ path: authFile });
});
