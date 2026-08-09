# Aura: Open Source IPTV Client for Android & iOS (Xtream Codes API)

Aura is a modern, premium, and open-source IPTV player built with React 19, Vite, and Capacitor. It features a stunning glassmorphic design and provides a high-end streaming experience for Android and iOS users, specifically optimized for Xtream Codes API providers.

## ✨ Features

- **Glassmorphism UI**: Beautifully designed interface with vibrant colors and blur effects.
- **Xtream Codes API Support**: Full support for **Live TV**, **VOD**, and **Series** from any Xtream-compatible provider.
- **Cross-Platform**: Designed for mobile (**Android & iOS**) using Capacitor, but also works perfectly as a web app.
- **Smart Category Management**: Effortlessly filter and browse through large IPTV playlists.
- **Persistent Caching**: Optimized with Stale-While-Revalidate caching for lightning-fast loading of categories and streams.
- **Account Profiles**: Securely save multiple IPTV provider accounts locally.
- **Demo Mode**: Try the app instantly with built-in demo content.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or pnpm
- Android Studio (for Android builds)
- Xcode (for iOS builds - macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/Aura-IPTV.git
   cd Aura-IPTV
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   Create a `.env` file in the root directory:
   ```env
   VITE_XTREAM_URL=your_provider_url
   VITE_XTREAM_USER=your_username
   VITE_XTREAM_PASS=your_password
   ```

### Development

Run the web version in development mode:
```bash
npm run dev
```

### Mobile Deployment (Capacitor)

1. Build the web app:
   ```bash
   npm run build
   ```

2. Sync with mobile platforms:
   ```bash
   npx cap sync
   ```

3. Open in IDEs to run on devices/emulators:
   ```bash
   npx cap open android
   npx cap open ios
   ```

## 📦 Download

Grab the latest signed `.apk` from the [Releases](../../releases) page and install it directly on Android — no Play Store needed. See [RELEASING.md](RELEASING.md) for how releases are built and published.

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing**: [React Router](https://reactrouter.com/)
- **Mobile Foundation**: [Capacitor](https://capacitorjs.com/)
- **Styling**: Vanilla CSS (Custom Design System)
- **Icons**: Custom SVG Icons

## 🏷️ Recommended GitHub Topics

To help others find this project, we recommend adding the following topics to your GitHub repository:
`iptv` `iptv-player` `xtream-codes` `android-iptv` `ios-iptv` `react` `capacitor` `glassmorphism` `open-source` `streaming-app`

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the open-source community.
