import { useEffect, useRef } from 'react';

export const isM3u8 = (url) => !!url && url.split('?')[0].toLowerCase().endsWith('.m3u8');

/**
 * Attaches an HLS (.m3u8) source to a <video> element.
 * Chromium WebView (Android) has no native HLS support, so we use hls.js there.
 * Safari/iOS supports HLS natively via canPlayType, so we skip hls.js and just set src.
 * Non-HLS sources (mp4) are left alone — caller sets video.src directly as before.
 */
export function useHlsPlayer(videoRef, src, { onFatalError } = {}) {
    const hlsRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        if (!isM3u8(src)) {
            video.src = src;
            return;
        }

        const canPlayNative = video.canPlayType('application/vnd.apple.mpegurl');
        if (canPlayNative) {
            video.src = src;
            return;
        }

        let disposed = false;

        const attachHls = async () => {
            const { default: Hls } = await import('hls.js');
            if (disposed) return;

            if (!Hls.isSupported()) {
                // Let the media element report the failure so another source can be tried.
                video.src = src;
                return;
            }

            let networkRecoveries = 0;
            let mediaRecoveries = 0;
            const hls = new Hls({
                enableWorker: true,
                backBufferLength: 30,
                maxBufferLength: 30,
                manifestLoadingMaxRetry: 3,
                levelLoadingMaxRetry: 3,
                fragLoadingMaxRetry: 3,
            });
            hlsRef.current = hls;
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!data.fatal) return;
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        if (networkRecoveries < 2) {
                            networkRecoveries += 1;
                            hls.startLoad();
                        } else {
                            onFatalError?.(data);
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        if (mediaRecoveries < 2) {
                            mediaRecoveries += 1;
                            hls.recoverMediaError();
                        } else {
                            onFatalError?.(data);
                        }
                        break;
                    default:
                        onFatalError?.(data);
                        break;
                }
            });
        };

        attachHls().catch((error) => onFatalError?.({ details: error.message }));

        return () => {
            disposed = true;
            hlsRef.current?.destroy();
            hlsRef.current = null;
        };
    }, [videoRef, src, onFatalError]);
}

export default useHlsPlayer;
