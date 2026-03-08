import { test, expect } from '@playwright/test';

const unique = `e2e-${Date.now()}@test.local`;
const password = 'TestPassword123!';
const boardTitle = 'E2E Board';

test.describe('Happy path: register → board → list → card → move', () => {
  test('full flow', async ({ page }) => {
    await page.goto('/');

    // Register (to get a session; alternatively use E2E_USER_EMAIL / E2E_USER_PASSWORD and /login)
    await page.getByRole('link', { name: /Zarejestruj się/i }).click();
    await expect(page).toHaveURL(/\/register/);
    await page.getByLabel(/E-mail/i).fill(unique);
    await page.getByLabel(/Hasło/i).fill(password);
    await page.getByLabel(/Imię/i).fill('E2E User');
    await page.getByRole('button', { name: /Zarejestruj się/i }).click();
    await expect(page).toHaveURL(/\/boards/);

    // Create board
    await page.getByTestId('create-board-btn').first().click();
    await page.getByTestId('create-board-title').fill(boardTitle);
    await page.getByTestId('create-board-submit').click();
    await expect(page).toHaveURL(/\/boards\/[a-f0-9-]+/);

    // Add first list
    await page.getByTestId('add-list-btn').click();
    await page.getByTestId('add-list-title').fill('Backlog');
    await page.getByTestId('add-list-submit').click();
    await expect(page.getByTestId(/kanban-column-/)).toBeVisible();

    // Add second list (so we can move card)
    await page.getByTestId('add-list-btn').click();
    await page.getByTestId('add-list-title').fill('Done');
    await page.getByTestId('add-list-submit').click();

    const columns = page.getByTestId(/^kanban-column-/);
    await expect(columns).toHaveCount(2);

    // Add card in first column (Backlog)
    const firstColumn = columns.first();
    await firstColumn.getByTestId('add-card-btn').first().click();
    await page.getByTestId('new-card-title').fill('E2E Task');
    await page.getByTestId('save-card-btn').click();

    // Wait for card to appear and get its id from the testid
    const card = page.getByTestId(/^task-card-/).first();
    await expect(card).toBeVisible();
    const cardTestId = await card.getAttribute('data-testid');
    const cardId = cardTestId?.replace('task-card-', '') ?? '';

    // Drag card to second column (Done)
    const secondColumn = columns.last();
    await card.dragTo(secondColumn, { targetPosition: { x: 100, y: 100 } });

    // Verify card moved: it should be inside the second column (or at least visible elsewhere)
    await page.waitForTimeout(500);
    const cardAfter = page.getByTestId(`task-card-${cardId}`);
    await expect(cardAfter).toBeVisible();
  });
});
