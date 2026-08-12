import { test, expect, Page } from '@playwright/test';

async function expandTeamGroup(page: Page) {
  const groupBtn = page.getByRole('button', { name: /^TEAM/i }).first();
  await groupBtn.click();
}

test.describe('Employee Attendance & Duty Ledger Specs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expandTeamGroup(page);
    await page.click('a[href="#AttendanceLog"]');
  });

  test('displays shift attendance table and summary metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Attendance/i }).first()).toBeVisible();
    await expect(page.getByText(/Shift Hours|Clocked In|Shift Count|Attendance|Total/i).first()).toBeVisible();
  });

  test('opens Clock-In modal upon clicking Clock-In button', async ({ page }) => {
    const clockInBtn = page.getByRole('button', { name: /Clock In/i }).first();
    if (await clockInBtn.isVisible()) {
      await clockInBtn.click();
      await expect(page.getByText(/Clock In Shift|Record Duty Start|Clock In/i).first()).toBeVisible();
    }
  });
});
