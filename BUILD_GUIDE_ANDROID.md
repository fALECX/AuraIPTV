# Build & Deployment Guide - Aura IPTV (Android)

Follow these steps to generate a signed production build for the Google Play Store.

## 1. Prerequisites
- **Android Studio** installed.
- **Java Development Kit (JDK)** installed.
- **Node.js & npm** installed.

## 2. Prepare Assets
The icons and splash screens I generated are located in the `C:\Users\samue\.gemini\antigravity\brain\9b5863d4-bb78-47eb-8f2c-e51a2930a749` directory.
To officially apply them to your Android project:
1. Install the capacitor-assets tool:
   ```bash
   npm install @capacitor/assets --save-dev
   ```
2. Place the `aura_app_icon.png` as `assets/logo.png` and `aura_splash_screen.png` as `assets/splash.png`.
3. Run the generator:
   ```bash
   npx capacitor-assets generate --android
   ```

## 3. Generate Release Keystore
You need a keystore to sign your app. Run this command in your terminal (replace `YOUR_PASSWORD`):
```bash
keytool -genkey -v -keystore aura-release.keystore -alias aura-alias -keyalg RSA -keysize 2048 -validity 10000
```
**IMPORTANT**: Keep this file (`aura-release.keystore`) safe. If you lose it, you cannot update your app in the future.

## 4. Build the App
1. Build the web project:
   ```bash
   npm run build
   ```
2. Sync with Android:
   ```bash
   npx cap sync android
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
