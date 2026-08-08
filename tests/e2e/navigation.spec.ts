import { test, expect } from '@playwright/test';

test.describe('Application Navigation & Core Header Specs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads home dashboard page with correct title and branding', async ({ page }) => {
    await expect(page).toHaveTitle(/Sahara - Agile Workspace|Sahara/i);
    await expect(page.getByText('Sahara', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Agile Workspace').first()).toBeVisible();
  });

  test('navigates seamlessly across primary sidebar screen tabs', async ({ page }) => {
    // 1. Navigate to Task Board
    await page.click('a[href="#TaskBoard"]');
    await expect(page.getByRole('heading', { name: /Task Board|Kanban/i }).first()).toBeVisible();

    // 2. Navigate to User Stories
    await page.click('a[href="#UserStories"]');
    await expect(page.getByRole('heading', { name: /User Stories/i }).first()).toBeVisible();

    // 3. Navigate to Attendance & Clock
    await page.click('a[href="#AttendanceLog"]');
    await expect(page.getByRole('heading', { name: /Attendance/i }).first()).toBeVisible();

    // 4. Navigate to Project Map
    await page.click('a[href="#ProjectMap"]');
    await expect(page.getByRole('heading', { name: /Project Map|Project Locations/i }).first()).toBeVisible();

    // 5. Navigate to Async Reports
    await page.click('a[href="#AsyncReports"]');
    await expect(page.getByRole('heading', { name: /Async Reports|Redis Queue/i }).first()).toBeVisible();
  });
});
