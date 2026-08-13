import { xtreamApi } from './xtream';

const cleanExtension = (extension, fallback = 'mp4') => {
    const value = String(extension || fallback).trim().toLowerCase().replace(/^\./, '');
    return /^[a-z0-9]+$/.test(value) ? value : fallback;
};

export function getPlaybackSources(item, api = xtreamApi) {
    if (!item?.stream_id) return { original: '', compatible: '', nativeCandidates: [] };

    if (item.type === 'live') {
        const hls = api.getLiveStreamUrl(item.stream_id, 'm3u8');
        const transportStream = api.getLiveStreamUrl(item.stream_id, 'ts');
        return {
            original: hls,
            compatible: transportStream,
            nativeCandidates: [...new Set([hls, transportStream])],
        };
    }

    const extension = cleanExtension(item.extension);
    const buildUrl = item.type === 'series'
        ? api.getSeriesStreamUrl.bind(api)
        : api.getVodStreamUrl.bind(api);
    const original = buildUrl(item.stream_id, extension);
    const compatible = buildUrl(item.stream_id, 'm3u8');

    return {
        original,
        compatible,
        nativeCandidates: [...new Set([original, compatible])],
    };
}

export function getWebPlaybackSource(item, useCompatibleSource, api = xtreamApi) {
    const sources = getPlaybackSources(item, api);
    return useCompatibleSource ? sources.compatible : sources.original;
}
