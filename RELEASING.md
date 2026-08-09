# Releasing Aura IPTV (Android)

Releases are built entirely by GitHub Actions. Pushing a version tag produces a
signed `.apk`, attached to a GitHub Release — nothing else. There's no local
Android Studio step required to ship a release.

## One-time setup: release signing key

This only needs to be done once per project (or whenever the key is rotated).

1. Generate a keystore (keep this file forever — losing it means you can never
   update the app under the same signature again):
   ```bash
   keytool -genkeypair -v -keystore aura-release.keystore \
     -alias aura -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Base64-encode it so it can live in a GitHub secret:
   ```bash
   base64 -w 0 aura-release.keystore > aura-release.keystore.b64   # Linux
   # macOS: base64 -i aura-release.keystore -o aura-release.keystore.b64
   # Windows PowerShell:
   # [Convert]::ToBase64String([IO.File]::ReadAllBytes("aura-release.keystore")) | Out-File aura-release.keystore.b64
   ```
3. In the GitHub repo, go to **Settings → Secrets and variables → Actions** and
   add these four repository secrets:
   | Secret | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | contents of `aura-release.keystore.b64` |
   | `ANDROID_KEYSTORE_PASSWORD` | the keystore password you set in step 1 |
   | `ANDROID_KEY_ALIAS` | `aura` (or whatever alias you used) |
   | `ANDROID_KEY_PASSWORD` | the key password you set in step 1 |
4. Delete the local `.keystore` and `.b64` files once the secrets are saved
   (or store them somewhere safe outside the repo — never commit them).

## Cutting a release

1. Make sure `main` is in the state you want to ship.
2. Tag it with a semver version (must match `v*.*.*`):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions (`.github/workflows/release.yml`) picks up the tag, builds
   the web app, syncs Capacitor, builds and signs the release APK, and
   publishes a GitHub Release named after the tag with
   `AuraIPTV-v1.0.0.apk` attached.
4. Watch progress under the repo's **Actions** tab. When it finishes, the
   release (and the APK) is live under **Releases**.

To re-run a release for the same tag, delete the tag and the GitHub Release
first, then re-push the tag.

## Local/debug builds

Every push to `main` and every PR runs `.github/workflows/ci.yml`, which
builds an unsigned debug APK and uploads it as a workflow artifact (not a
release) for smoke-testing. For a local build:
```bash
npm install
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```
The debug APK lands at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Version numbering

`versionName` (the human-readable version, e.g. `1.0.0`) and `versionCode`
(an internal integer Android uses to compare versions) are both derived from
the git tag by the release workflow — you don't need to edit
`android/app/build.gradle` by hand. `versionCode` is computed as
`major*1_000_000 + minor*1_000 + patch`, so tags must stay within
`0-999` per segment and must always increase for Android to accept an update
over a previous install.
