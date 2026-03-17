/**
 * TypeScript type definitions for Aura IPTV
 * Provides type safety for API responses and component props
 */

/**
 * Content type enumeration
 */
export type ContentType = 'live' | 'movie' | 'series';

/**
 * Credentials for connecting to IPTV provider
 */
export interface Credentials {
    url: string;
    username: string;
    password: string;
}

/**
 * Profile saved in local storage
 */
export interface Profile extends Credentials {
    name: string;
}

/**
 * Base stream/vod/series item
 */
export interface BaseItem {
    id: string;
    title: string;
    genre: string;
    type: ContentType;
    poster?: string;
    hero?: string;
    desc?: string;
    rating: number;
    year?: string;
    added?: number;
}

/**
 * Live TV channel
 */
export interface LiveStream extends BaseItem {
    type: 'live';
    stream_id: number;
    extension?: string;
}

/**
 * Movie (VOD)
 */
export interface VodStream extends BaseItem {
    type: 'movie';
    stream_id: number;
    extension?: string;
    duration?: string;
}

/**
 * Series
 */
export interface SeriesStream extends BaseItem {
    type: 'series';
    stream_id: number;
    extension?: string;
}

/**
 * Episode info for series
 */
export interface Episode {
    id: string;
    season_number?: number;
    episode_num: number;
    title?: string;
    info?: {
        duration?: string;
        movie_image?: string;
    };
    container_extension?: string;
}

/**
 * Series info with episodes
 */
export interface SeriesInfo {
    seasons?: Array<{
        season_number: number;
        season_name?: string;
    }>;
    episodes?: Record<string, Episode[]>;
}

/**
 * Category for filtering streams
 */
export interface Category {
    category_id: string;
    category_name: string;
    count?: number;
}

/**
 * User info from Xtream API
 */
export interface XtreamUserInfo {
    auth: number;
    username: string;
    password?: string;
    status?: string;
    exp_date?: string;
    is_trial?: number;
    active_cons?: number;
    created_at?: string;
    max_connections?: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Screen navigation types
 */
export type ScreenName = 'setup' | 'home' | 'detail' | 'player';

/**
 * App state
 */
export interface AppState {
    screen: ScreenName;
    selectedItem: BaseItem | null;
    playingItem: BaseItem | null;
    credentials: Credentials | null;
    activeTab: string;
}

/**
 * Player state
 */
export interface PlayerState {
    playing: boolean;
    progress: number;
    duration: number;
    volume: number;
    muted: boolean;
    playbackSpeed: number;
    isFullscreen: boolean;
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

/**
 * Modal state
 */
export interface ModalState {
    isOpen: boolean;
    title?: string;
    content?: React.ReactNode;
    onConfirm?: () => void;
    onCancel?: () => void;
}
