import { beforeEach, describe, expect, it } from 'vitest';
import { clearWatchProgress, getContinueWatchingItems, getHistoryForTab, getWatchProgressDetails, hasBeenWatched, markAsWatched, parseDurationSeconds, saveWatchProgress } from './watchProgress';

describe('watch progress', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('parses provider durations and persists position, duration, and timestamp', () => {
        const episode = { id: 'episode-1', type: 'series', duration: '00:40:00' };
        saveWatchProgress(episode, 600, 2400);

        expect(parseDurationSeconds('01:02:03')).toBe(3723);
        expect(getWatchProgressDetails(episode)).toMatchObject({
            position: 600,
            duration: 2400,
            percentage: 25,
            watched: false,
        });
        expect(getWatchProgressDetails(episode).updatedAt).toBeGreaterThan(0);
    });

    it('links a series history card to its most recent episode progress', () => {
        const episode = { id: 'episode-2', type: 'series', duration: 1000 };
        const series = { id: 'series-1', type: 'series', title: 'Series', resumeItem: episode };
        saveWatchProgress(episode, 250, 1000);

        expect(getContinueWatchingItems([series])).toEqual([
            expect.objectContaining({ id: 'series-1', watchPosition: 250, progressPercentage: 25 }),
        ]);
        expect(getHistoryForTab([series], 'series')).toHaveLength(1);
        expect(getHistoryForTab([series], 'movies')).toHaveLength(0);
    });

    it('shows completed episodes as fully watched but not as unfinished content', () => {
        const movie = { id: 'movie-1', type: 'movie', duration: 100 };
        expect(hasBeenWatched(movie)).toBe(false);
        markAsWatched(movie, 100);
        clearWatchProgress(movie);

        expect(getWatchProgressDetails(movie)).toMatchObject({ watched: true, percentage: 100 });
        expect(hasBeenWatched(movie)).toBe(true);
        expect(getContinueWatchingItems([movie])).toEqual([]);
    });
});
