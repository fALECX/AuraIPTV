import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.route('**/*', route => {
        const resourceType = route.request().resourceType();
        if (['image', 'media', 'font'].includes(resourceType)) return route.abort();
        return route.continue();
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
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

    await search.press('Enter');
    await expect(search).not.toBeFocused();
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

test('last used demo account logs in automatically after an app restart', async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try with Demo Content' })).toHaveCount(0);
});

test('movies tab exposes its own continue-watching segment and watched badge', async ({ page }) => {
    await page.evaluate(() => {
        const movie = {
            id: 'vod_movie-1', stream_id: 'movie-1', title: 'Dune: Part Two', type: 'movie',
            genre: 'Movie', poster: 'poster.jpg', duration: 1000, lastWatchedAt: Date.now(),
        };
        localStorage.setItem('aura_hist_demo', JSON.stringify([movie]));
        localStorage.setItem('aura_pos_vod_movie-1', '950');
        localStorage.setItem('aura_duration_vod_movie-1', '1000');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Movies' }).click();

    const segment = page.getByRole('region', { name: 'Last watched and continue watching' });
    await expect(segment).toBeVisible();
    await expect(segment.getByText('Continue Watching')).toBeVisible();
    await expect(segment.getByLabel('Watched')).toBeVisible();
});
