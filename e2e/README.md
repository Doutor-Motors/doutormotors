# E2E Test Directory

This folder contains Playwright E2E tests for CarCare Diagnóstico.

## Structure

- `auth.setup.ts` - Authentication setup (runs before authenticated tests)
- `public-pages.spec.ts` - Tests for public pages (landing, about, etc.)
- `dashboard.spec.ts` - Tests for authenticated dashboard pages
- `forms.spec.ts` - Tests for forms (contact, FAQ, etc.)

## Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/public-pages.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in UI mode
npx playwright test --ui

# Run specific browser
npx playwright test --project=chromium
```

## Authenticated Tests

To run authenticated tests, set environment variables:

```bash
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
npx playwright test
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Best Practices

1. Use data-testid attributes for stable selectors
2. Avoid hard-coded waits, use Playwright's auto-waiting
3. Keep tests independent and isolated
4. Use page objects for complex pages
5. Test user flows, not implementation details
