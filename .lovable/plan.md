

# Fix Plan: Video Fullscreen, APK Build, and Google Drive URL Issues

## Issue 1: Fullscreen Video Auto-Play in Landscape Mode

**Problem:** When the fullscreen button is pressed, the video should automatically rotate to landscape and continue playing (like YouTube), regardless of the phone's orientation lock setting.

**Current behavior:** The `toggleLandscape` function requests fullscreen and tries to lock orientation, but doesn't ensure the video keeps playing. The `toggleFullscreen` function doesn't rotate at all.

**Fix:**
- Merge `toggleFullscreen` and `toggleLandscape` into one button -- pressing fullscreen should always enter landscape + fullscreen (like YouTube)
- After entering fullscreen, call `screen.orientation.lock('landscape')` and ensure the video is playing via `playerRef.current.playVideo()`
- On exit fullscreen, unlock orientation
- For Google Drive iframe videos, use the Capacitor `ScreenOrientation` plugin for native behavior
- Remove the separate landscape button since fullscreen = landscape (YouTube behavior)

**Files to change:**
- `app/components/custom-video-player.tsx` -- merge fullscreen logic, auto-play on fullscreen enter
- `app/components/custom-video-player.module.css` -- no major changes needed

---

## Issue 2: Building the APK

**Problem:** You need step-by-step instructions to turn this into an Android APK.

**Steps you need to follow (on your local machine):**

1. **Export to GitHub** -- In Lovable, click your project name > Settings > GitHub tab > "Export to GitHub" to push the code to your GitHub repo

2. **Clone and install:**
   ```
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   npm install
   ```

3. **Build the web app:**
   ```
   npm run build
   ```

4. **Add Android platform:**
   ```
   npx cap add android
   ```

5. **Sync the web build to Android:**
   ```
   npx cap sync android
   ```

6. **Open in Android Studio:**
   ```
   npx cap open android
   ```

7. **In Android Studio:**
   - Wait for Gradle sync to finish
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`

8. **For a signed release APK (needed for Play Store):**
   - In Android Studio: Build > Generate Signed Bundle / APK
   - Choose APK
   - Create a new keystore or use an existing one
   - Select "release" build type
   - The signed APK will be in `android/app/build/outputs/apk/release/`

**Important notes:**
- You need Android Studio installed (download from https://developer.android.com/studio)
- For hot-reload during development, the `capacitor.config.ts` already points to the Lovable preview URL. For the final APK build, you should remove or comment out the `server.url` line so the app uses the local built files instead
- Every time you pull new code, run `npm run build && npx cap sync android` before rebuilding the APK

---

## Issue 3: Google Drive URL Not Accepted in Teacher Content Manager

**Problem:** When a teacher tries to add a lesson with a Google Drive URL like `https://drive.google.com/file/d/.../view?usp=drive_link`, the validation rejects it or the form flow is confusing.

**Root cause:** The validation in the action function checks `contentUrl.includes('drive.google.com')` which should work, but the form UX is the real issue -- the "Source" dropdown is always visible regardless of content type, and selecting "Document" still shows "YouTube" as an option.

**Fix -- make the form dynamic based on content type selection:**

In `app/routes/teacher-content-manager.tsx`:
- Add state for `lessonType` and `videoSource` to control conditional rendering
- When "Video" is selected: show source selector with "YouTube" and "Google Drive" options, then show URL input
- When "Document" is selected: hide source selector entirely, show URL input with Google Drive placeholder
- Remove the validation that blocks non-Google-Drive URLs for documents -- or broaden it to accept any URL
- Fix the validation: the current Google Drive URL check works but the form might be submitting with wrong defaults

**Specific changes:**
- Add `useState` for `lessonType` (default: 'video') and `videoSource` (default: 'youtube')
- Conditionally render the "Source" select only when `lessonType === 'video'`
- Update placeholders and help text dynamically
- When document is selected, auto-set `videoSource` to 'gdrive' via hidden input
- Show/hide duration vs page count fields based on type
- Fix the action validation to properly accept Google Drive sharing links with query params

**Files to change:**
- `app/routes/teacher-content-manager.tsx` -- dynamic form fields with state-driven conditional rendering

---

## Technical Details

### Video Player Changes (custom-video-player.tsx)
- Remove the `toggleLandscape` function
- Update `toggleFullscreen` to: enter fullscreen, lock to landscape, and call `playVideo()` if paused
- On fullscreen exit (in the `handleFullscreenChange` listener), unlock orientation
- Remove the landscape button (`Smartphone` icon) from both YouTube and GDrive player controls

### Teacher Content Manager Changes (teacher-content-manager.tsx)
- Add `const [lessonType, setLessonType] = useState('video')` and `const [videoSource, setVideoSource] = useState('youtube')`
- Wire `onValueChange` on the content type Select to update `lessonType` state
- Conditionally render source Select only when `lessonType === 'video'`
- When `lessonType === 'document'`, add `<input type="hidden" name="videoSource" value="gdrive" />`
- Show duration field only for video, page count only for document
- Update help text per type

