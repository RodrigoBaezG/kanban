import { test, expect } from '@playwright/test';

test.describe('Kanban Board MVP', () => {
  test('should render the board with 5 fixed columns', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Project Workspace');

    const columns = ['To Do', 'In Progress', 'Review', 'Testing', 'Done'];
    for (const title of columns) {
      // The columns have a layout that ensures the title is visible.
      await expect(page.locator(`.column-title:has-text("${title}")`)).toBeVisible();
    }
  });

  test('should add a new card safely', async ({ page }) => {
    await page.goto('/');
    
    // Initial dummy data check
    await expect(page.locator('.kanban-card')).toHaveCount(4);

    // Add a card to the To Do column
    const todoColumn = page.locator('.kanban-column').filter({ hasText: 'To Do' }).first();
    await todoColumn.locator('button:has-text("+ Add a Card")').click();

    // Fill form
    await expect(page.locator('.add-card-modal')).toBeVisible();
    await page.fill('input[name="title"]', 'New Playwright Task');
    await page.fill('textarea[name="details"]', 'Integration test details');
    await page.click('button:has-text("Add Card")');

    // Modal closes implicitly
    await expect(page.locator('.add-card-modal')).not.toBeVisible();

    // Await addition to DOM
    await expect(page.locator('.kanban-card').filter({ hasText: 'New Playwright Task' })).toBeVisible();
    await expect(page.locator('.kanban-card')).toHaveCount(5);
  });

  test('should delete an existing card safely', async ({ page }) => {
    await page.goto('/');
    
    // Check initial count
    await expect(page.locator('.kanban-card')).toHaveCount(4);
    
    // Delete the first card
    const cardToDelete = page.locator('.kanban-card').filter({ hasText: 'Database Migration' }).first();
    await cardToDelete.hover();
    await cardToDelete.locator('.delete-card-btn').click({ force: true });
    
    // Verify changes
    await expect(page.locator('.kanban-card')).toHaveCount(3);
    await expect(page.locator('.kanban-card').filter({ hasText: 'Database Migration' })).not.toBeVisible();
  });
});
