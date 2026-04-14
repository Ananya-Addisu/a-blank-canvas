# Educational Platform

An Ethiopian-focused educational platform connecting students with quality courses and learning materials.

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Documentation

- [Build Guide](docs/BUILD-GUIDE.md) - Complete build and deployment instructions
- [Security Features](docs/SECURITY-FEATURES.md) - Security implementation details
- [Platform Overview](docs/README.md) - Detailed platform information

## Tech Stack

- **Frontend**: React 19, TypeScript, React Router v7
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: CSS Modules, Custom Design System
- **Icons**: Lucide React
- **Charts**: Recharts

## Features

### Student Portal
- Course browsing and enrollment
- Video lessons
- Library access
- Competitions
- Payment submission

### Teacher Portal
- Course creation
- Student management
- Earnings tracking
- Content uploads

### Admin Portal
- User management
- Payment approvals
- Content moderation
- System configuration

## Environment Variables

Create a `.env` file:

```env
SUPABASE_PROJECT_URL=your_project_url
SUPABASE_API_KEY=your_api_key
```

## Build for Production

```bash
npm run build
npm run start
```

## Capacitor Mobile Build Pipeline

To generate a fresh Android APK while ensuring synchronization with the latest remote changes and project configurations, follow this consolidated workflow:

### ⚙️ Build & Sync Sequence

1.  **Repository Synchronization & Environment Prep**
    *   Restore local build artifacts to a clean state.
    *   Fetch and pull the latest updates from the `main` branch.
    *   Ensure the upstream tracking is correctly set.
    ```bash
    git restore dist/client/index.html
    git fetch origin main
    git pull
    git branch --set-upstream-to=origin/main main
    ```

2.  **Configuration Verification**
    *   Validate `package.json` dependencies and `capacitor.config.ts` settings.
    *   **Note**: The `buildDirectory` in `react-router.config.ts` must be set to `dist` (and `webDir` in `capacitor.config.ts` accordingly) to maintain compatibility with the Android asset pipeline.

3.  **Production Compilation**
    *   Build the React production bundle, synchronize assets with the Android platform, and compile the final APK.
    ```bash
    npm run build
    npx cap sync android
    cd android && ./gradlew assembleDebug && cd ..
    ```

---

## Recent Maintenance Summary

*   **Integrated Remote Updates**: Successfully merged the latest Supabase client configurations and new administrative management routes.
*   **Asset Pipeline Optimization**: Reverted the build output directory to `dist` within `react-router.config.ts`. This ensures that the Capacitor sync process correctly identifies the web assets for the Android bundle.
*   **End-to-End Build**: Completed a full production cycle resulting in a verified debug APK.

**Final APK Output**:  
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Mobile App Architecture & Security

The Android port of this platform is powered by **Capacitor 8.0** and has been hardened with native security features.

### 🛡️ Core Security Features (`MainActivity.java`)
The native entry point has been customized to protect educational content and ensure platform integrity:
*   **Screenshot & Screen Recording Prevention**: Uses `FLAG_SECURE` to block all forms of screen capture.
*   **Anti-Tamper & Environment Checks**:
    *   **Emulator Blocking**: Automatically terminates if common emulators (BlueStacks, Nox, etc.) are detected.
    *   **Root Detection**: Blocks execution on rooted devices to prevent unauthorized file access.
    *   **Debug/Mirroring Prevention**: Closes the app if a debugger is attached or if external screen mirroring is active.
*   **MagsterSecurity JS Bridge**: Exposes `window.MagsterSecurity` to the React frontend, allowing the web app to query status bar height, check for developer mode, or programmatically exit.

### 🎨 Visual Identity
*   **Custom Splash Screen**: A high-fidelity white splash screen featuring the Magster Academy logo centered, implemented via a native `layer-list` for smooth transition during app launch.
*   **Branding Assets**: All density-specific icons have been optimized and synchronized from the latest design specifications to ensure a premium look.

---

## 🛠️ Environment Configuration

To ensure consistent builds, the following environment specifications are used:

*   **Java Runtime**: JDK 17 (Required)
*   **Java Home Path**: `C:\Program Files\Java\jdk-17`
*   **Capacitor ID**: `com.magster.app`
*   **Build Tool**: Gradle 8.x with forced Java 17 compatibility across all subprojects.
