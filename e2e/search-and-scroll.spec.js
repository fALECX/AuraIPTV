import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Try with Demo Content' }).click();
});

test('movies search never includes live channels or series', async ({ page }) => {
    await page.getByRole('button', { name: 'Movies' }).click();
    await page.getByRole('button', { name: 'Search' }).click();
    const search = page.getByRole('textbox', { name: 'Search movies…' });
    await search.fill('the');

    const results = page.getByLabel('Movies search results');
    await expect(results.getByRole('button', { name: /The Batman/ })).toBeVisible();
    await expect(results.getByText('LIVE')).toHaveCount(0);
    await expect(results.getByText('Series', { exact: true })).toHaveCount(0);
});

test('dragging on a movie card scrolls without opening its details', async ({ page }) => {
    await page.getByRole('button', { name: 'Movies' }).click();
    const card = page.getByRole('button', { name: 'Dune: Part Two' });
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y - 40, { steps: 5 });
    await page.mouse.up();
    await expect(page.getByRole('button', { name: /Play Now/ })).toHaveCount(0);
});
