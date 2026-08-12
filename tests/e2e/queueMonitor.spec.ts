import { test, expect, Page } from '@playwright/test';

async function expandInsightsGroup(page: Page) {
  const groupBtn = page.getByRole('button', { name: /^INSIGHTS/i }).first();
  await groupBtn.click();
}

test.describe('Redis Pattern Background Job Queue & DLQ Monitor Specs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expandInsightsGroup(page);
    await page.click('a[href="#AsyncReports"]');
  });

  test('renders live queue statistics badges and Trigger Midnight Report control', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Async Reports|Redis Queue/i }).first()).toBeVisible();
    await expect(page.getByText(/Waiting/i).first()).toBeVisible();
    await expect(page.getByText(/Active/i).first()).toBeVisible();

    const triggerBtn = page.getByRole('button', { name: /Trigger Midnight Job|Trigger/i }).first();
    await expect(triggerBtn).toBeVisible();
  });
});
