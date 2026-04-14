# Magster - Android APK Build Instructions

## Prerequisites

- **Windows/Mac/Linux** computer
- **Node.js v18+** installed ([download here](https://nodejs.org/))
- **Android Studio** installed ([download here](https://developer.android.com/studio))
- **Java JDK 17+** (Android Studio installs this automatically)
- **Git** installed ([download here](https://git-scm.com/downloads))

---

## Step-by-Step Instructions

### Step 1: Export Code from Lovable to GitHub

1. In Lovable, click your **project name** at the top
2. Go to **Settings** → **GitHub** tab
3. Click **"Export to GitHub"**
4. Choose a repository name (e.g., `magster-app`)
5. Wait for the export to finish

### Step 2: Clone the Repository

Open a terminal (Command Prompt / Terminal / PowerShell) and run:

```bash
git clone https://github.com/YOUR_USERNAME/magster-app.git
cd magster-app
```

Replace `YOUR_USERNAME` with your actual GitHub username and `magster-app` with whatever you named your repo.

### Step 3: Install All Dependencies

```bash
npm install
```

This installs React, React Router, Capacitor, and everything else the project needs. Wait for it to finish completely.

### Step 4: Build the Web App

```bash
npm run build
```

This creates the production build in the `build/` folder.

### Step 5: Configure for Local APK Build

Open the file `capacitor.config.ts` in a text editor and **comment out or remove** the `server` section so the APK uses local files instead of the Lovable preview URL:

**Before:**
```typescript
server: {
  url: 'https://547b1a77-236d-4ca1-8862-8724f8789023.lovableproject.com?forceHideBadge=true',
  cleartext: true,
},
```

**After:**
```typescript
// server: {
//   url: 'https://547b1a77-236d-4ca1-8862-8724f8789023.lovableproject.com?forceHideBadge=true',
//   cleartext: true,
// },
```

> **Note:** If you want to test with live-reload from Lovable (for development), keep it uncommented. For the final APK, always comment it out.

### Step 6: Add Android Platform

```bash
npx cap add android
```

This creates the `android/` folder with the native Android project.

### Step 7: Sync Web Build to Android

```bash
npx cap sync android
```

This copies your built web app into the Android project and installs native plugins.

### Step 8: Open in Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio automatically.

### Step 9: Build the APK in Android Studio

1. **Wait** for Gradle sync to finish (you'll see a progress bar at the bottom)
2. Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for the build to complete
4. Click **"locate"** in the notification that appears, or find the APK at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Transfer this APK to your phone and install it

### Step 10 (Optional): Build a Signed Release APK

For publishing to the Google Play Store:

1. In Android Studio: **Build** → **Generate Signed Bundle / APK**
2. Select **APK** → click **Next**
3. Click **Create new...** to create a keystore:
   - Choose a save location
   - Set a password (remember this!)
   - Fill in at least one certificate field (e.g., your name)
   - Click **OK**
4. Select **release** build type → click **Create**
5. The signed APK will be at:
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

---

## Updating the APK After Code Changes

Every time you pull new code from Lovable/GitHub:

```bash
git pull
npm install
npm run build
npx cap sync android
```

Then open Android Studio and rebuild the APK (Step 8-9).

---

## Troubleshooting

### "SDK location not found"
- Open Android Studio → **Settings** → **Languages & Frameworks** → **Android SDK**
- Make sure an SDK is installed (e.g., Android 14 / API 34)

### "Gradle build failed"
- Make sure Java 17+ is installed
- In Android Studio: **File** → **Invalidate Caches** → restart

### "Could not determine the dependencies of task ':app:compileDebugJavaWithJavac'"
- Run: `npx cap sync android` again

### APK crashes on launch
- Make sure you ran `npm run build` before `npx cap sync android`
- Make sure `capacitor.config.ts` has `server.url` commented out for local builds

### White screen after install
- Check that `webDir` in `capacitor.config.ts` is set to `build/client`
- Rebuild: `npm run build && npx cap sync android`

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run build` | Build the web app for production |
| `npx cap add android` | Add Android platform (first time only) |
| `npx cap sync android` | Sync web build to Android |
| `npx cap open android` | Open project in Android Studio |
| `npx cap run android` | Run on connected device/emulator |

---

## App Configuration

The app is configured in `capacitor.config.ts`:

| Setting | Current Value |
|---------|--------------|
| App ID | `com.magster.app` |
| App Name | `Magster` |
| Web Directory | `build/client` |
