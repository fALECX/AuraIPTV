import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { toast } from '../components/Toast';
import { useHlsPlayer } from '../hooks/useHlsPlayer';
import { getPlaybackSources } from '../services/playback';
import { canUseNativeAndroidPlayer, openNativeAndroidPlayer } from '../services/nativePlayer';
import { clearWatchProgress, getWatchProgress, markAsWatched, saveWatchProgress } from '../utils/watchProgress';
import './PlayerScreen.css';

const BackIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const PlayFill = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>;
const PauseFill = () => <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const SkipBack = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></svg>;
const SkipFwd = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></svg>;
const VolumeIcon = ({ muted }) => muted
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>;
const PipIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><rect x="12" y="12" width="8" height="6" rx="1" fill="currentColor" stroke="none" /></svg>;
const FullscreenIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>;
const ExitFullscreenIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="10" y1="14" x2="3" y2="21" /><line x1="21" y1="3" x2="14" y2="10" /></svg>;
const SleepIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const ScreenIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
const MusicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>;

function formatTime(s) {
    if (isNaN(s) || s < 0) return '00:00';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return h > 0 ? `${h}:${m}:${ss}` : `${m}:${ss}`;
}

const getInitialStartDecision = (item) => {
    const savedPosition = item?.type === 'live' ? 0 : (getWatchProgress(item) || 0);
    return {
        itemId: item?.id,
        status: savedPosition > 10 && !item?.autoResume ? 'prompt' : 'ready',
        position: savedPosition > 10 ? savedPosition : 0,
    };
};

export default function PlayerScreen({ item, onBack, onPlayNext }) {
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(() => {
        try {
            const settings = JSON.parse(localStorage.getItem('aura_player_settings') || '{}');
            return settings.playbackSpeed || 1;
        } catch { return 1; }
    });
    const [streamError, setStreamError] = useState(false);
    const [errorDetail, setErrorDetail] = useState('');
    const [transcodeFallback, setTranscodeFallback] = useState(() => {
        try {
            const settings = JSON.parse(localStorage.getItem('aura_player_settings') || '{}');
            return settings.preferredQuality === 'transcoded';
        } catch { return false; }
    });
    const [lastInteractionTime, setLastInteractionTime] = useState(() => Date.now());
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [startDecision, setStartDecision] = useState(() => getInitialStartDecision(item));
    const [showNextCountdown, setShowNextCountdown] = useState(false);
    const [nextCountdown, setNextCountdown] = useState(5);
    const [isBuffering, setIsBuffering] = useState(false);
    const [sleepTimer, setSleepTimer] = useState(null);
    const [sleepTimeRemaining, setSleepTimeRemaining] = useState(0);
    const [keepScreenOn, setKeepScreenOn] = useState(() => {
        try {
            const settings = JSON.parse(localStorage.getItem('aura_player_settings') || '{}');
            return settings.keepScreenOn !== false;
        } catch { return true; }
    });
    const [audioMode, setAudioMode] = useState(false);
    const [nativePlayerFailed, setNativePlayerFailed] = useState(false);
    const videoRef = useRef(null);
    const positionSaveRef = useRef(null);
    const sleepTimerRef = useRef(null);
    const wakeLockRef = useRef(null);
    const nativeLaunchRef = useRef(null);
    const appliedStartRef = useRef(null);
    const onBackRef = useRef(onBack);
    const onPlayNextRef = useRef(onPlayNext);

    useEffect(() => {
        onBackRef.current = onBack;
        onPlayNextRef.current = onPlayNext;
    }, [onBack, onPlayNext]);

    const playbackSources = useMemo(
        () => getPlaybackSources({
            stream_id: item?.stream_id,
            type: item?.type,
            extension: item?.extension,
        }),
        [item?.stream_id, item?.type, item?.extension],
    );
    const itemId = item?.id;
    const itemType = item?.type;
    const positionKey = itemId ? `aura_pos_${itemId}` : null;
    const streamUrl = transcodeFallback ? playbackSources.compatible : playbackSources.original;
    const shouldUseNativePlayer = canUseNativeAndroidPlayer() && !nativePlayerFailed;
    const startIsReady = startDecision.itemId === itemId && startDecision.status === 'ready';

    const handlePlaybackFailure = useCallback((detail = '') => {
        setIsBuffering(false);

        if (!transcodeFallback && playbackSources.compatible && playbackSources.compatible !== playbackSources.original) {
            setTranscodeFallback(true);
            setStreamError(false);
            setErrorDetail('');
            setPlaying(true);
            toast.info('Trying a compatible stream source…');
            return;
        }

        setPlaying(false);
        setStreamError(true);
        setErrorDetail(detail);
    }, [playbackSources.compatible, playbackSources.original, transcodeFallback]);

    const onHlsFatalError = useCallback(
        (error) => handlePlaybackFailure(error?.details || 'The HLS stream could not be loaded.'),
        [handlePlaybackFailure],
    );
    useHlsPlayer(videoRef, shouldUseNativePlayer ? null : streamUrl, { onFatalError: onHlsFatalError });

    useEffect(() => {
        let preferCompatible = false;
        try {
            const settings = JSON.parse(localStorage.getItem('aura_player_settings') || '{}');
            preferCompatible = itemType !== 'live' && settings.preferredQuality === 'transcoded';
        } catch { /* use original source */ }
        setTranscodeFallback(preferCompatible);
        setStreamError(false);
        setErrorDetail('');
        setNativePlayerFailed(false);
        nativeLaunchRef.current = null;
        appliedStartRef.current = null;
        const nextDecision = getInitialStartDecision(item);
        setStartDecision(nextDecision);
        setPlaying(nextDecision.status === 'ready');
        setIsBuffering(nextDecision.status === 'ready');
    }, [item, itemId, itemType]);

    // Save playback position every 5 seconds
    useEffect(() => {
        if (!positionKey || itemType === 'live') return;
        positionSaveRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.currentTime > 5) {
                saveWatchProgress(item, videoRef.current.currentTime, videoRef.current.duration);
            }
        }, 5000);
        return () => clearInterval(positionSaveRef.current);
    }, [item, itemType, positionKey]);

    useEffect(() => () => {
        const video = videoRef.current;
        if (itemType !== 'live' && video?.currentTime > 5) {
            saveWatchProgress(item, video.currentTime, video.duration);
        }
    }, [item, itemType]);

    // Buffering detection
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('canplay', onPlaying);
        return () => {
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onPlaying);
        };
    }, []);

    // Sleep timer
    useEffect(() => {
        if (sleepTimer === null) {
            setSleepTimeRemaining(0);
            return;
        }

        setSleepTimeRemaining(sleepTimer * 60);

        sleepTimerRef.current = setInterval(() => {
            setSleepTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(sleepTimerRef.current);
                    setSleepTimer(null);
                    if (videoRef.current) {
                        videoRef.current.pause();
                        setPlaying(false);
                    }
                    toast.info('Sleep timer: Playback stopped');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(sleepTimerRef.current);
    }, [sleepTimer]);

    // Screen Wake Lock
    useEffect(() => {
        const requestWakeLock = async () => {
            if (!keepScreenOn) return;
            try {
                if ('wakeLock' in navigator) {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.warn('Wake lock not available:', err);
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                try {
                    await wakeLockRef.current.release();
                    wakeLockRef.current = null;
                } catch { }
            }
        };

        requestWakeLock();

        // Re-request wake lock on visibility change
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && keepScreenOn) {
                requestWakeLock();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            releaseWakeLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [keepScreenOn]);

    const seek = useCallback((timeChange) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime + timeChange);
    }, []);

    // Media Session API for lock screen controls and background playback
    useEffect(() => {
        if (!('mediaSession' in navigator) || !item) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: item.title,
            artist: item.genre || 'Aura IPTV',
            artwork: item.poster || item.hero ? [
                { src: item.poster || item.hero, sizes: '512x512', type: 'image/png' }
            ] : []
        });

        navigator.mediaSession.setActionHandler('play', () => {
            if (videoRef.current) videoRef.current.play();
            setPlaying(true);
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            if (videoRef.current) videoRef.current.pause();
            setPlaying(false);
        });

        navigator.mediaSession.setActionHandler('seekbackward', () => {
            seek(-15);
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
            seek(15);
        });

        return () => {
            navigator.mediaSession.metadata = null;
        };
    }, [item, seek]);

    // Save settings when changed
    const saveSettings = useCallback((updates) => {
        try {
            const current = JSON.parse(localStorage.getItem('aura_player_settings') || '{}');
            localStorage.setItem('aura_player_settings', JSON.stringify({ ...current, ...updates }));
        } catch { }
    }, []);

    // Auto-hide controls after 4s of no interaction
    useEffect(() => {
        if (!showControls) return;
        const t = setTimeout(() => setShowControls(false), 4000);
        return () => clearTimeout(t);
    }, [showControls, lastInteractionTime]);

    // Orientation / resize
    useEffect(() => {
        const handleResize = () => setShowControls(true);
        window.addEventListener('orientationchange', handleResize);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('orientationchange', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Fullscreen change listener
    useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onChange);
        document.addEventListener('webkitfullscreenchange', onChange);
        return () => {
            document.removeEventListener('fullscreenchange', onChange);
            document.removeEventListener('webkitfullscreenchange', onChange);
        };
    }, []);

    // Play / Pause
    useEffect(() => {
        if (startIsReady && !shouldUseNativePlayer && videoRef.current && !streamError) {
            if (playing) {
                videoRef.current.play().catch(e => {
                    console.warn('Autoplay prevented:', e);
                    if (e.name === 'NotSupportedError') setStreamError(true);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [playing, shouldUseNativePlayer, startIsReady, streamError, streamUrl]);

    // Volume sync
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = muted ? 0 : volume;
        }
    }, [volume, muted]);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const current = videoRef.current.currentTime;
        const total = videoRef.current.duration;
        if (total > 0) {
            setProgress((current / total) * 100);
            setDuration(total);
        }
    };

    const handleEnded = () => {
        setPlaying(false);
        if (item) {
            markAsWatched(item, videoRef.current?.duration || duration);
            clearWatchProgress(item);
        }
        // Offer auto-play next if callback provided
        if (onPlayNext) {
            setShowNextCountdown(true);
            setNextCountdown(5);
        }
    };

    // Android playback runs in a native Media3 activity so MKV/HEVC and HLS are
    // handled by the device media stack rather than the more limited WebView.
    useEffect(() => {
        if (!shouldUseNativePlayer || !startIsReady || !item?.id || nativeLaunchRef.current === item.id) return;

        let cancelled = false;
        nativeLaunchRef.current = item.id;
        setIsBuffering(true);

        openNativeAndroidPlayer({
            urls: playbackSources.nativeCandidates,
            title: item.title || '',
            subtitle: [item.genre, item.year].filter(Boolean).join(' · '),
            isLive: itemType === 'live',
            startPositionMs: Math.round((itemType === 'live' ? 0 : startDecision.position) * 1000),
        }).then((result) => {
            if (cancelled) return;
            setIsBuffering(false);

            if (itemType !== 'live' && result?.positionMs > 5000) {
                saveWatchProgress(item, result.positionMs / 1000, result.durationMs / 1000);
            }

            if (result?.ended) {
                markAsWatched(item, result.durationMs / 1000);
                clearWatchProgress(item);
                setPlaying(false);
                if (onPlayNextRef.current) onPlayNextRef.current();
                else onBackRef.current({ keepPlaying: false });
                return;
            }

            if (result?.error) {
                setTranscodeFallback(true);
                setPlaying(false);
                setErrorDetail(result.error);
                setStreamError(true);
                return;
            }

            onBackRef.current({ keepPlaying: false });
        }).catch((error) => {
            if (cancelled) return;
            console.warn('Native player unavailable, falling back to WebView playback:', error);
            nativeLaunchRef.current = null;
            setNativePlayerFailed(true);
            setIsBuffering(true);
            setStreamError(false);
            setPlaying(true);
        });

        return () => { cancelled = true; };
    }, [item, item?.genre, item?.id, item?.title, item?.type, item?.year, itemId, itemType, playbackSources.nativeCandidates, shouldUseNativePlayer, startDecision.position, startIsReady]);

    // Auto-next countdown
    useEffect(() => {
        if (!showNextCountdown) return;
        if (nextCountdown <= 0) {
            setShowNextCountdown(false);
            onPlayNext?.();
            return;
        }
        const t = setTimeout(() => setNextCountdown(v => v - 1), 1000);
        return () => clearTimeout(t);
    }, [showNextCountdown, nextCountdown, onPlayNext]);

    const cycleSpeed = () => {
        const speeds = [1, 1.25, 1.5, 2];
        const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
        if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
        saveSettings({ playbackSpeed: nextSpeed });
        toast.info(`Speed: ${nextSpeed}×`);
    };

    const toggleQuality = () => {
        const newValue = !transcodeFallback;
        setTranscodeFallback(newValue);
        setStreamError(false);
        setErrorDetail('');
        setIsBuffering(true);
        setPlaying(true);
        saveSettings({ preferredQuality: newValue ? 'transcoded' : 'original' });
        toast.info(newValue ? 'Source: Compatible HLS' : 'Source: Original');
    };

    const cycleSleepTimer = () => {
        const options = [null, 15, 30, 45, 60];
        const currentIndex = options.indexOf(sleepTimer);
        const nextIndex = (currentIndex + 1) % options.length;
        setSleepTimer(options[nextIndex]);
        if (options[nextIndex]) {
            toast.info(`Sleep timer: ${options[nextIndex]} min`);
        } else {
            toast.info('Sleep timer: Off');
        }
    };

    const toggleWakeLock = () => {
        setKeepScreenOn(prev => {
            saveSettings({ keepScreenOn: !prev });
            return !prev;
        });
        toast.info(keepScreenOn ? 'Screen lock: Off' : 'Screen lock: On');
    };

    const toggleAudioMode = () => {
        setAudioMode(prev => !prev);
        toast.info(audioMode ? 'Video mode: On' : 'Audio mode: On - minimize to listen');
    };

    const toggleSubtitles = () => {
        if (!videoRef.current) return;
        const tracks = videoRef.current.textTracks;
        if (!tracks || tracks.length === 0) {
            toast.info('No subtitles available for this stream');
            return;
        }
        let anyShowing = false;
        for (let i = 0; i < tracks.length; i++) {
            if (tracks[i].mode === 'showing') { anyShowing = true; tracks[i].mode = 'hidden'; }
        }
        if (!anyShowing) {
            tracks[0].mode = 'showing';
            toast.success(`Subtitles: ${tracks[0].label || tracks[0].language || 'Track 1'}`);
        } else {
            toast.info('Subtitles off');
        }
    };

    const cycleAudioTrack = () => {
        if (!videoRef.current) return;
        const tracks = videoRef.current.audioTracks;
        if (!tracks || tracks.length <= 1) {
            toast.info('No alternate audio tracks available');
            return;
        }
        let currentIndex = -1;
        for (let i = 0; i < tracks.length; i++) { if (tracks[i].enabled) currentIndex = i; }
        const nextIndex = (currentIndex + 1) % tracks.length;
        for (let i = 0; i < tracks.length; i++) tracks[i].enabled = (i === nextIndex);
        toast.success(`Audio: ${tracks[nextIndex].label || tracks[nextIndex].language || `Track ${nextIndex + 1}`}`);
    };

    const toggleFullscreen = () => {
        const el = document.documentElement;
        if (!document.fullscreenElement) {
            (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
        } else {
            (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
        }
    };

    const togglePip = async () => {
        if (!videoRef.current) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoRef.current.requestPictureInPicture();
            }
        } catch {
            toast.error('Picture-in-Picture not supported on this device');
        }
    };

    const tap = useCallback((e) => {
        setLastInteractionTime(Date.now());
        const isInteractive = e.target.closest('button') || e.target.closest('.player-progress-wrap') || e.target.closest('.player-volume-track') || e.target.closest('.player-bottom');
        if (isInteractive) return;
        setShowControls(v => !v);
    }, []);

    const currentSeconds = duration ? (progress / 100) * duration : 0;

    return (
        <div className="player-screen" onClick={tap} style={{ background: audioMode ? 'transparent' : '#000' }}>
            <video
                ref={videoRef}
                className="player-video-bg"
                autoPlay={!shouldUseNativePlayer && startIsReady}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        videoRef.current.volume = volume;
                        videoRef.current.playbackRate = playbackSpeed;
                        if (startIsReady && appliedStartRef.current !== itemId) {
                            videoRef.current.currentTime = startDecision.position;
                            appliedStartRef.current = itemId;
                            if (playing) videoRef.current.play().catch(() => {});
                        }
                    }
                }}
                onEnded={handleEnded}
                onError={() => {
                    const mediaError = videoRef.current?.error;
                    const detail = mediaError?.message || `Media error ${mediaError?.code || 'unknown'}`;
                    console.error('Video error:', detail);
                    handlePlaybackFailure(detail);
                }}
                style={{
                    width: audioMode ? '1px' : '100%',
                    height: audioMode ? '1px' : '100%',
                    objectFit: 'contain',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: streamError ? 'none' : (audioMode ? 'block' : 'block'),
                    position: audioMode ? 'fixed' : 'relative',
                    top: audioMode ? '-9999px' : '0'
                }}
            />

            {/* Audio Mode Background */}
            {audioMode && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', zIndex: 1
                }}>
                    <div style={{
                        width: 120, height: 120, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4f7dff, #8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 24, animation: 'pulse 2s infinite'
                    }}>
                        <MusicIcon />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>
                        {item?.title}
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                        {item?.genre} • Audio Mode
                    </div>
                </div>
            )}

            {/* Buffering Indicator */}
            {isBuffering && !streamError && (
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    zIndex: 15, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12
                }}>
                    <div style={{
                        width: 50, height: 50,
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Buffering...</span>
                </div>
            )}

            {/* Resume prompt */}
            {startDecision.itemId === itemId && startDecision.status === 'prompt' && (
                <div style={{
                    position: 'absolute', bottom: 100, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(18,20,30,0.95)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 16, padding: '16px 20px', zIndex: 20, display: 'flex',
                    flexDirection: 'column', gap: 12, minWidth: 260, backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}>
                    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                        Resume from {formatTime(startDecision.position)}?
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => {
                            setStartDecision(current => ({ ...current, status: 'ready' }));
                            setPlaying(true);
                            setIsBuffering(true);
                        }} style={{
                            flex: 1, padding: '10px', borderRadius: 10, background: '#4f7dff',
                            border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>Resume</button>
                        <button onClick={() => {
                            clearWatchProgress(item);
                            setStartDecision(current => ({ ...current, status: 'ready', position: 0 }));
                            setPlaying(true);
                            setIsBuffering(true);
                        }} style={{
                            flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>From start</button>
                    </div>
                </div>
            )}

            {/* Auto-next episode overlay */}
            {showNextCountdown && onPlayNext && (
                <div style={{
                    position: 'absolute', bottom: 100, right: 24,
                    background: 'rgba(18,20,30,0.95)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 16, padding: '16px 20px', zIndex: 20, display: 'flex',
                    flexDirection: 'column', gap: 12, maxWidth: 220, backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                }}>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Next episode in</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{nextCountdown}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setShowNextCountdown(false); onPlayNext(); }} style={{
                            flex: 1, padding: '9px', borderRadius: 10, background: '#4f7dff',
                            border: 'none', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>Play now</button>
                        <button onClick={() => setShowNextCountdown(false)} style={{
                            flex: 1, padding: '9px', borderRadius: 10, background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        }}>Cancel</button>
                    </div>
                </div>
            )}

            {/* Error Overlay */}
            {streamError && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, background: '#000', color: '#fff', flexDirection: 'column', padding: '20px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600 }}>Playback Error</h3>
                    <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.7)', fontSize: '14px', maxWidth: '300px' }}>
                        The stream could not be played after trying the available sources. It may use a codec this device cannot decode, or the provider link may have expired.
                    </p>
                    {errorDetail && <p style={{ margin: '-10px 0 18px', color: 'rgba(255,255,255,0.45)', fontSize: '11px', maxWidth: '320px', overflowWrap: 'anywhere' }}>{errorDetail}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
                        <button onClick={() => onBack({ keepPlaying: false })} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
                            <BackIcon /> Go Back
                        </button>
                        {!transcodeFallback && (
                            <button onClick={() => { setTranscodeFallback(true); setStreamError(false); setErrorDetail(''); setIsBuffering(true); setPlaying(true); setTimeout(() => videoRef.current?.load(), 50); }}
                                style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                                Try Compatible Source
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div className={`player-overlay ${showControls ? '' : 'hidden'}`}>
                {/* Top */}
                <div className="player-top">
                    <button className="player-back-btn" onClick={onBack}><BackIcon /></button>
                    <div className="player-title-block">
                        <div className="player-title">{item?.title}</div>
                        <div className="player-subtitle">{item?.genre} · {item?.year}</div>
                    </div>
                    {item?.type === 'live' && <div className="player-live-chip"><span className="player-live-dot" />LIVE</div>}
                    <button className="player-top-icon" onClick={togglePip}><PipIcon /></button>
                    <button className="player-top-icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                    </button>
                </div>

                {/* Center play controls */}
                <div className="player-center">
                    <button className="player-center-btn" onClick={() => seek(-15)}><SkipBack /></button>
                    <button className="player-main-play" onClick={() => setPlaying(v => !v)}>
                        {playing ? <PauseFill /> : <PlayFill />}
                    </button>
                    <button className="player-center-btn" onClick={() => seek(15)}><SkipFwd /></button>
                </div>

                {/* Bottom glass controls */}
                <div className="player-bottom">
                    <div className="player-glass-controls">
                        {/* Progress */}
                        {item?.type !== 'live' && (
                            <>
                                <div className="player-time-row">
                                    <span className="player-time">{formatTime(currentSeconds)}</span>
                                    <span className="player-time">{formatTime(duration)}</span>
                                </div>
                                <div
                                    className="player-progress-wrap"
                                    onClick={e => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pct = ((e.clientX - rect.left) / rect.width) * 100;
                                        const newTime = (pct / 100) * duration;
                                        if (videoRef.current) videoRef.current.currentTime = newTime;
                                        setProgress(Math.max(0, Math.min(100, pct)));
                                    }}
                                >
                                    <div className="player-progress-fill" style={{ width: `${progress}%` }}>
                                        <div className="player-progress-thumb" />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Bottom Row */}
                        <div className="player-controls-row">
                            {/* Volume */}
                            <div className="player-volume-row">
                                <button className="player-ctrl-btn" onClick={() => setMuted(v => !v)}>
                                    <VolumeIcon muted={muted || volume === 0} />
                                </button>
                                <div
                                    className="player-volume-track"
                                    onClick={e => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                                        setVolume(pct);
                                        setMuted(false);
                                    }}
                                >
                                    <div className="player-volume-fill" style={{ width: `${(muted ? 0 : volume) * 100}%` }} />
                                </div>
                            </div>

                            <button className="player-ctrl-btn" onClick={cycleAudioTrack}>Audio</button>
                            <button className="player-ctrl-btn" onClick={toggleSubtitles}>CC</button>
                            <button className="player-ctrl-btn" onClick={toggleQuality}>{transcodeFallback ? 'HD' : 'SD'}</button>
                            <button className="player-ctrl-btn" onClick={cycleSpeed}>{playbackSpeed}×</button>
                            <button className="player-ctrl-btn" onClick={cycleSleepTimer} style={{ color: sleepTimer ? '#4f7dff' : 'inherit' }}>
                                <SleepIcon />{sleepTimer ? ` ${sleepTimeRemaining}m` : ''}
                            </button>
                            <button className="player-ctrl-btn" onClick={toggleWakeLock} style={{ color: keepScreenOn ? '#4f7dff' : 'inherit' }}>
                                <ScreenIcon />
                            </button>
                            <button className="player-ctrl-btn" onClick={toggleAudioMode} style={{ color: audioMode ? '#4f7dff' : 'inherit' }}>
                                <MusicIcon />
                            </button>
                            <button className="player-ctrl-btn" onClick={toggleFullscreen}>
                                {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
