import { test, expect } from '@playwright/test';

const TEST_USER = 'TestUser';
const TEST_PROJECT_ID = 'test_p1';

const BOARD_SEED: Record<string, string> = {
  kanban_user: TEST_USER,
  [`kanban_projects_${TEST_USER}`]: JSON.stringify([
    { id: TEST_PROJECT_ID, name: 'My Project', color: '#209dd7' },
  ]),
  [`kanban_cols_${TEST_USER}_${TEST_PROJECT_ID}`]: JSON.stringify([
    { id: 'col_0', title: 'To Do' },
    { id: 'col_1', title: 'In Progress' },
    { id: 'col_2', title: 'Review' },
    { id: 'col_3', title: 'Testing' },
    { id: 'col_4', title: 'Done' },
  ]),
  [`kanban_cards_${TEST_USER}_${TEST_PROJECT_ID}`]: JSON.stringify([
    { id: '1', columnId: 'col_0', title: 'Database Migration', details: 'Migrate users to new schema.' },
    { id: '2', columnId: 'col_0', title: 'Setup CI/CD', details: 'Configure GitHub Actions for deployment.' },
    { id: '3', columnId: 'col_1', title: 'Kanban Board components', details: 'Create Board, Column, Card UI.' },
    { id: '4', columnId: 'col_4', title: 'Project Scaffolding', details: 'Initialize Next.js project and setup tests.' },
  ]),
};

// ── Projects page ──────────────────────────────────────────────────────────
test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((seed) => {
      for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
    }, BOARD_SEED);
  });

  test('should show project cards when logged in', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.projects-grid')).toBeVisible();
    await expect(page.locator('.project-card').filter({ hasText: 'My Project' })).toBeVisible();
    await expect(page.locator('.project-card-open')).toBeVisible();
  });

  test('should navigate to board when a project card is clicked', async ({ page }) => {
    await page.goto('/');
    await page.locator('.project-card').filter({ hasText: 'My Project' }).click();
    await expect(page.locator('.kanban-column')).toHaveCount(5);
    await expect(page.locator('.app-title')).toContainText('My Project');
  });
});

// ── Kanban Board ───────────────────────────────────────────────────────────
test.describe('Kanban Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((seed) => {
      for (const [key, value] of Object.entries(seed)) localStorage.setItem(key, value);
    }, BOARD_SEED);
  });

  test('should render board with project name and 5 columns', async ({ page }) => {
    await page.goto(`/board?projectId=${TEST_PROJECT_ID}`);
    await expect(page.locator('.app-title')).toContainText('My Project');
    for (const title of ['To Do', 'In Progress', 'Review', 'Testing', 'Done']) {
      await expect(page.locator(`.column-title:has-text("${title}")`)).toBeVisible();
    }
  });

  test('should add a new card', async ({ page }) => {
    await page.goto(`/board?projectId=${TEST_PROJECT_ID}`);
    await expect(page.locator('.kanban-card')).toHaveCount(4);

    const todoColumn = page.locator('.kanban-column').filter({ hasText: 'To Do' }).first();
    await todoColumn.locator('button:has-text("+ Add a Card")').click();

    await expect(page.locator('.add-card-modal')).toBeVisible();
    await page.fill('input[name="title"]', 'New Playwright Task');
    await page.fill('textarea[name="details"]', 'Integration test details');
    await page.click('button:has-text("Add Card")');

    await expect(page.locator('.add-card-modal')).not.toBeVisible();
    await expect(page.locator('.kanban-card').filter({ hasText: 'New Playwright Task' })).toBeVisible();
    await expect(page.locator('.kanban-card')).toHaveCount(5);
  });

  test('should delete an existing card', async ({ page }) => {
    await page.goto(`/board?projectId=${TEST_PROJECT_ID}`);
    await expect(page.locator('.kanban-card')).toHaveCount(4);

    const cardToDelete = page.locator('.kanban-card').filter({ hasText: 'Database Migration' }).first();
    await cardToDelete.hover();
    await cardToDelete.locator('.delete-card-btn').click({ force: true });

    await expect(page.locator('.kanban-card')).toHaveCount(3);
    await expect(page.locator('.kanban-card').filter({ hasText: 'Database Migration' })).not.toBeVisible();
  });

  test('should show back button linking to projects page', async ({ page }) => {
    await page.goto(`/board?projectId=${TEST_PROJECT_ID}`);
    await expect(page.locator('.back-btn')).toBeVisible();
    await page.locator('.back-btn').click();
    await expect(page.locator('.projects-grid')).toBeVisible();
  });
});

// ── Auth ───────────────────────────────────────────────────────────────────
test.describe('Auth', () => {
  test('should show login screen when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.auth-card')).toBeVisible();
    await expect(page.locator('.auth-tab:has-text("Log In")')).toBeVisible();
    await expect(page.locator('.auth-tab:has-text("Sign Up")')).toBeVisible();
    await expect(page.locator('button:has-text("Continue as Demo")')).toBeVisible();
  });

  test('should redirect unauthenticated board access to home', async ({ page }) => {
    await page.goto('/board?projectId=anything');
    await expect(page.locator('.auth-card')).toBeVisible();
  });

  test('should log in as demo user and show projects', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Continue as Demo")');
    await expect(page.locator('.user-name')).toContainText('Demo');
    await expect(page.locator('.projects-grid')).toBeVisible();
    await expect(page.locator('.project-card').filter({ hasText: 'My Project' })).toBeVisible();
  });

  test('should sign up and see projects page', async ({ page }) => {
    await page.goto('/');
    await page.click('.auth-tab:has-text("Sign Up")');
    await page.fill('input[name="name"]', 'NewUser');
    await page.fill('input[name="password"]', 'pass123');
    await page.fill('input[name="confirm"]', 'pass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('.user-name')).toContainText('NewUser');
    await expect(page.locator('.projects-grid')).toBeVisible();
  });

  test('should reject login with wrong password', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('kanban_users', JSON.stringify([{ name: 'Alice', password: 'secret' }]));
    });
    await page.goto('/');
    await page.fill('input[name="name"]', 'Alice');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.auth-error')).toBeVisible();
  });

  test('should log in with correct credentials', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('kanban_users', JSON.stringify([{ name: 'Alice', password: 'secret' }]));
    });
    await page.goto('/');
    await page.fill('input[name="name"]', 'Alice');
    await page.fill('input[name="password"]', 'secret');
    await page.click('button[type="submit"]');
    await expect(page.locator('.user-name')).toContainText('Alice');
    await expect(page.locator('.projects-grid')).toBeVisible();
  });
});
