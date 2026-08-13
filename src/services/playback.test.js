import { describe, expect, it } from 'vitest';
import { getPlaybackSources } from './playback';

const api = {
    getLiveStreamUrl: (id, ext) => `https://test/live/${id}.${ext}`,
    getVodStreamUrl: (id, ext) => `https://test/movie/${id}.${ext}`,
    getSeriesStreamUrl: (id, ext) => `https://test/series/${id}.${ext}`,
};

describe('getPlaybackSources', () => {
    it('keeps MKV as the native original and adds HLS as a fallback', () => {
        expect(getPlaybackSources({ type: 'movie', stream_id: 7, extension: 'mkv' }, api)).toEqual({
            original: 'https://test/movie/7.mkv',
            compatible: 'https://test/movie/7.m3u8',
            nativeCandidates: ['https://test/movie/7.mkv', 'https://test/movie/7.m3u8'],
        });
    });

    it('uses HLS first and transport stream second for live channels', () => {
        expect(getPlaybackSources({ type: 'live', stream_id: 9 }, api).nativeCandidates).toEqual([
            'https://test/live/9.m3u8',
            'https://test/live/9.ts',
        ]);
    });
});
