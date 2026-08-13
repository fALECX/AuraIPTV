import { Capacitor, registerPlugin } from '@capacitor/core';

const NativePlayer = registerPlugin('NativePlayer');

export const canUseNativeAndroidPlayer = () => (
    Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android'
);

export const openNativeAndroidPlayer = (options) => NativePlayer.open(options);
