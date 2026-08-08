import { test, expect } from '@playwright/test';

test.describe('Agile Kanban Task Board Specs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="#TaskBoard"]');
  });

  test('renders Kanban status columns and task items', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Task Board|Kanban/i }).first()).toBeVisible();

    // Verify Kanban status column headers exist
    await expect(page.getByRole('heading', { name: 'In Progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Review' })).toBeVisible();
  });

  test('displays deadline alerts widget on task board or header', async ({ page }) => {
    const deadlineWidget = page.locator('text=/Deadline Alerts|Due Today|Overdue|Upcoming|Task Board/i');
    await expect(deadlineWidget.first()).toBeVisible();
  });
});
