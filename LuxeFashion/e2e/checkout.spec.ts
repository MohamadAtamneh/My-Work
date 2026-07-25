import { test, expect } from '@playwright/test';

// Critical revenue path: home → shop → search → product → cart → sign-in gate.
// (The Stripe card step needs test keys in both .env files; extend this spec
// with a full paid-checkout run once STRIPE test keys are configured.)
test('browse → search → product → cart → checkout requires sign-in', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/LuxeFashion/);

  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: 'All Collections' })).toBeVisible();

  // Fuzzy search via the query param the header search bar produces
  await page.goto('/shop?q=tee');
  await expect(page.getByRole('heading', { name: /Results for/ })).toBeVisible();

  // Open the first product card
  await page.goto('/shop');
  await page.locator('.card a').first().click();
  await expect(page).toHaveURL(/\/product\//);
  await expect(page.getByRole('button', { name: 'Add to Cart' }).first()).toBeVisible();

  // Add to cart and verify it shows up
  await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();

  // Checkout is gated behind authentication
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await expect(page.getByText('You need an account to place an order.')).toBeVisible();
});
