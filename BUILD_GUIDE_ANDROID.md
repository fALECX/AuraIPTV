# Build & Deployment Guide - Aura IPTV (Android)

Follow these steps to generate a signed production build for the Google Play Store.

## 1. Prerequisites
- **Node.js 22+** and npm installed.
- **JDK 21** (a full JDK containing `jlink`, not a stripped runtime).
- **Android SDK Platform 36** and Build Tools 35.0.0. Android Studio is optional if the command-line tools are installed.

Verify the complete web and Android toolchain:
```bash
npm run verify
npm run android:build
```

The Windows Android build helper detects `JAVA_HOME`, `ANDROID_HOME`, the default user SDK, and Aura's optional portable JDK automatically.

## 2. Prepare Assets
The generated Android icons and splash resources are already committed under `android/app/src/main/res`; no extra asset generator is required for normal builds.

## 3. Generate Release Keystore
You need a keystore to sign your app. Run this command in your terminal (replace `YOUR_PASSWORD`):
```bash
keytool -genkey -v -keystore aura-release.keystore -alias aura-alias -keyalg RSA -keysize 2048 -validity 10000
```
**IMPORTANT**: Keep this file (`aura-release.keystore`) safe. If you lose it, you cannot update your app in the future.

## 4. Build the App
1. Build, test, and sync the web project:
   ```bash
   npm run verify
   npm run android:sync
   ```
3. Open Android Studio:
   ```bash
   npx cap open android
   ```

## 5. Generate Signed Bundle (AAB) in Android Studio
1. In Android Studio, go to **Build > Generate Signed Bundle / APK...**
2. Select **Android App Bundle** and click **Next**.
3. Choose your `aura-release.keystore` file, enter your passwords and alias from step 3.
4. Select **release** build variant.
5. Click **Finish**. Your `.aab` file will be generated in `android/app/release/`.

## 6. Upload to Play Console
1. Go to your [Google Play Console](https://play.google.com/console).
2. Create a new App.
3. Upload the `.aab` file in the **Production** track.
4. Provide the Privacy Policy URL (hosted on GitHub Pages as we discussed).
