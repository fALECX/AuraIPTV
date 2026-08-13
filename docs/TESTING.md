# Testing and playback verification

Aura uses three complementary test layers because no single tool can cover React behavior, a packaged Android WebView, system UI, and hardware codecs reliably.

## Fast local checks

```bash
npm run verify
npm run test:e2e
```

- Vitest and Testing Library cover tab-scoped search, playback URL fallback, and tap-versus-scroll gestures.
- Playwright runs the visible menu and search flows with a Pixel-class mobile viewport and records traces/screenshots on failures.

## Build and test the APK

```powershell
npm run android:build
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
cd android
./gradlew connectedDebugAndroidTest
```

The instrumented UI Automator test launches the packaged APK from outside its process and verifies the Movies navigation/search flow through Android accessibility nodes. This is the right layer for APK and system-level flows; Espresso remains available for native in-process UI tests.

## Playback matrix

Android uses Media3/ExoPlayer for the native player and tries the provider's original URL before its compatible HLS/TS source. The web/iOS path uses the browser media element plus lazy-loaded hls.js and the same source fallback policy.

Run media smoke tests on at least:

- an official Android emulator for navigation and H.264/AAC HLS;
- one physical baseline Android device;
- one physical HEVC-capable device for MP4 and MKV;
- a live HLS channel, a live TS fallback, an MP4 VOD, an MKV VOD, and a series episode;
- an expired URL and an unsupported codec to verify that buffering disappears and the actionable error remains readable.

Codec decoding is ultimately device-dependent. Media3 can demux HLS, MP4, MPEG-TS, and Matroska, but a device must expose a decoder for the contained video/audio format. A provider-side H.264/AAC HLS rendition is therefore the universal final fallback.
