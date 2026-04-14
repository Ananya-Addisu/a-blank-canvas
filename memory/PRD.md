# Magster Educational Platform - PRD

## Original Problem Statement
"google drive videos still are not using the custom controls and behaviors i have setup for youtube videos. i want it to use the custom controls i have made in the custom player and not the default google drive video embed controls."

## Architecture
- React Router v7 + Vite + TypeScript
- Supabase (PostgreSQL + Auth + Storage)
- CSS Modules with custom design tokens

## What Was Implemented

### 2026-04-02 - Google Drive Video Full Custom Player Fix

**Root Cause:** Google Drive's `/preview` iframe cannot be controlled via JavaScript. Even wrapping it in the custom player shell only gave a fullscreen button — play/pause, seek, volume, speed, and skip all needed the video to be in an HTML5 `<video>` element.

**Solution:**
1. **New server-side proxy route** `app/routes/api-gdrive-proxy.$fileId.tsx`
   - Streams Google Drive video content server-side, bypassing CORS
   - Forwards `Range` headers so video seeking works properly
   - Registered in `app/routes.ts` as `api/gdrive-proxy/:fileId`

2. **Updated `app/components/custom-video-player.tsx`**
   - Added `videoRef = useRef<HTMLVideoElement>()` for HTML5 video control
   - All control functions (`togglePlay`, `toggleMute`, `handleSeek`, `skip`, `handleVolumeChange`, `cyclePlaybackSpeed`, `handleProgressBarClick`) now conditionally use `videoRef` (for GDrive) or `playerRef` (for YouTube API)
   - GDrive path renders `<video src="/api/gdrive-proxy/{fileId}">` inside the full custom player shell
   - Identical controls UI to YouTube: play/pause, seek bar with progress fill, volume slider, time display, skip ±10s, speed cycle, clean view, fullscreen

3. **Registered route** in `app/routes.ts`

## Core Requirements
- Google Drive videos use IDENTICAL custom player controls as YouTube videos
- All controls work: play/pause, seek bar, volume, mute, playback speed (0.5x–2x), skip ±10s, fullscreen (native + fake landscape), clean view
- Loading state shown while video buffering
- `onVideoEnd` callback fires when GDrive video ends (progress tracking)

## Backlog / Future
- Caching: Add `Cache-Control` headers or CDN layer to reduce proxy load for frequently watched videos
- Watermark: Optionally overlay student name/ID on GDrive videos (same as SecureVideoPlayer)
- Progress tracking: Hook `onVideoEnd` to lesson completion for GDrive lessons
