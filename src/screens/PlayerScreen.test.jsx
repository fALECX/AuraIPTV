import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const nativePlayer = vi.hoisted(() => ({
    open: vi.fn(() => new Promise(() => {})),
}));

vi.mock('../services/nativePlayer', () => ({
    canUseNativeAndroidPlayer: () => true,
    openNativeAndroidPlayer: nativePlayer.open,
}));

vi.mock('../hooks/useHlsPlayer', () => ({ useHlsPlayer: () => {} }));

import PlayerScreen from './PlayerScreen';
import { saveWatchProgress } from '../utils/watchProgress';

const episode = {
    id: 'episode-42', stream_id: 42, type: 'series', extension: 'mkv',
    title: 'Episode 42', genre: 'Series', duration: 1200,
};

describe('PlayerScreen resume gate', () => {
    beforeEach(() => {
        localStorage.clear();
        nativePlayer.open.mockClear();
    });

    it('does not launch native Android playback before the resume choice', async () => {
        saveWatchProgress(episode, 300, 1200);
        render(<PlayerScreen item={episode} onBack={vi.fn()} />);

        expect(screen.getByText('Resume from 05:00?')).toBeVisible();
        expect(nativePlayer.open).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
        await waitFor(() => expect(nativePlayer.open).toHaveBeenCalledWith(
            expect.objectContaining({ startPositionMs: 300000 }),
        ));
    });

    it('launches from zero only after choosing from start', async () => {
        saveWatchProgress(episode, 300, 1200);
        render(<PlayerScreen item={episode} onBack={vi.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'From start' }));
        await waitFor(() => expect(nativePlayer.open).toHaveBeenCalledWith(
            expect.objectContaining({ startPositionMs: 0 }),
        ));
    });
});
