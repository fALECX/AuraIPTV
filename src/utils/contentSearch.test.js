import { describe, expect, it } from 'vitest';
import { searchContentForTab } from './contentSearch';

const rawData = {
    live: [{ stream_id: 1, name: 'Batman Live' }],
    vod: [{ stream_id: 2, name: 'Batman Begins', container_extension: 'mkv' }],
    series: [{ series_id: 3, name: 'Batman: The Series' }],
};

describe('searchContentForTab', () => {
    it('returns only movie results on the movies tab', () => {
        const results = searchContentForTab(rawData, 'movies', 'batman');
        expect(results).toHaveLength(1);
        expect(results[0]).toMatchObject({ id: 'vod_2', type: 'movie', extension: 'mkv' });
    });

    it('returns only live channels on the live tab', () => {
        const results = searchContentForTab(rawData, 'live', 'batman');
        expect(results).toHaveLength(1);
        expect(results[0].type).toBe('live');
    });

    it('searches all content from home and rejects one-character queries', () => {
        expect(searchContentForTab(rawData, 'home', 'batman')).toHaveLength(3);
        expect(searchContentForTab(rawData, 'home', 'b')).toEqual([]);
    });
});
