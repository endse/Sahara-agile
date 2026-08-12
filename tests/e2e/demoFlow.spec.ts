import { test, expect, Page } from '@playwright/test';

const PROJECT_NAME = 'End-to-End Verification Platform';
const PROJECT_REGION = 'Sector 1 - Core Platform';
const PROJECT_LABEL = `${PROJECT_NAME} (${PROJECT_REGION})`;
const STORY_TITLE = 'E2E API telemetry stream story';
const TASK_TITLE = 'Configure E2E Redis cluster rate limiting';

async function expandGroup(page: Page, name: string) {
  await page.getByRole('button', { name: new RegExp(`^${name}`, 'i') }).first().click();
}

test.describe('End-to-End Workspace CRUD Flow (fresh Firestore)', () => {
  test('creates a project, user story, and task; persists after reload', async ({ page }) => {
    await page.goto('/');

    // --- 1. Create a Project ---
    await expandGroup(page, 'WORKSPACE');
    await page.click('a[href="#Projects"]');
    await expect(page.getByRole('heading', { name: /Projects/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('heading', { name: 'New Project' })).toBeVisible();
    await page.fill('#project-name', PROJECT_NAME);
    await page.fill('#project-start-date', '2026-09-01');
    await page.fill('#project-end-date', '2026-12-31');
    await page.selectOption('#project-region', PROJECT_REGION);
    await page.getByRole('button', { name: /Save Project/i }).click();
    await expect(page.getByText(`Current Project Context: ${PROJECT_NAME}`)).toBeVisible();

    // --- 2. Create a User Story (parented to the new project) ---
    await page.click('a[href="#UserStories"]');
    await expect(page.getByRole('heading', { name: /User Stories/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /New User Story/i }).click();
    await expect(page.getByText('Create User Story')).toBeVisible();
    await page.selectOption('#story-parent-project', { label: PROJECT_LABEL });
    await page.fill('#story-title-input', STORY_TITLE);
    await page.fill('#story-desc-input', 'As a field engineer, I want live telemetry so that pressure alarms trigger instantly.');
    await page.fill('#story-assignee-input', 'Current User');
    await page.getByRole('button', { name: /Save User Story/i }).click();
    await expect(page.getByText(STORY_TITLE).first()).toBeVisible();

    // --- 3. Create a Task on the Kanban Board ---
    await page.click('a[href="#TaskBoard"]');
    await expect(page.getByRole('heading', { name: /Task Board|Kanban/i }).first()).toBeVisible();
    await page.getByRole('button', { name: /New Task/i }).first().click();
    await expect(page.getByRole('heading', { name: 'New Task' })).toBeVisible();
    await page.fill('#task-title', TASK_TITLE);
    await page.getByRole('button', { name: /Create Task/i }).click();
    await expect(page.getByRole('heading', { name: /Task Board|Kanban/i }).first()).toBeVisible();
    await expect(page.getByText(TASK_TITLE).first()).toBeVisible();

    // --- 4. Persistence across full page reload ---
    await page.reload();
    await expandGroup(page, 'WORKSPACE');
    await page.click('a[href="#Projects"]');
    await expect(page.getByText(`Current Project Context: ${PROJECT_NAME}`)).toBeVisible({ timeout: 15000 });
    await page.click('a[href="#TaskBoard"]');
    await expect(page.getByRole('heading', { name: /Task Board|Kanban/i }).first()).toBeVisible();
    await expect(page.getByText(TASK_TITLE).first()).toBeVisible();
  });
});
