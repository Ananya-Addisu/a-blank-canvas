# Future Plans

## Download Feature (Currently Disabled)

The download feature was fully implemented but disabled to simplify the initial release. Here's how it works for future re-enablement:

### Architecture

1. **Dual-Link System for Videos**: Each video lesson supports two URLs:
   - `youtube_url` — YouTube link for streaming via the custom player
   - `download_url` — Google Drive link for downloading the video file

2. **Database Fields** (already in `lessons` table):
   - `is_downloadable` (boolean) — Whether the lesson can be downloaded
   - `download_url` (text) — Google Drive sharing URL for download

3. **Download Tracking** (`user_downloads` table):
   - Tracks all downloads per user with `content_id`, `content_type`, `file_path`, `file_size`
   - Supports soft-delete via `is_deleted` flag
   - Tracks `last_accessed` and `downloaded_at` timestamps
   - Server service: `app/services/download.server.ts`

4. **Native App (Capacitor) Offline Downloads**:
   - `app/utils/video-download.ts` — Handles downloading videos/documents to device storage via Capacitor Filesystem
   - Supports progress tracking, file size formatting, and offline playback
   - Downloaded content is stored locally and accessible via the "Offline" tab in Downloads page

5. **Downloads Page** (`app/routes/downloads.tsx`):
   - Three tabs: Documents (saved PDFs), Bookmarks (saved video links), Offline (native downloads)
   - Search functionality across all tabs
   - Remove/delete actions for each item

6. **Video Player Download Button**:
   - The custom video player (`app/components/custom-video-player.tsx`) had a download button in the controls bar
   - Additionally, a "Download Video" button was shown above the video in the course player

7. **Google Drive Integration**:
   - Server-side validation of Google Drive URLs (`app/utils/gdrive-check.server.ts`)
   - Proxy for streaming Google Drive content (`app/utils/gdrive-proxy.ts`, `supabase/functions/gdrive-proxy/`)
   - Teachers were required to provide both YouTube URL (streaming) and Google Drive URL (download) for video lessons

8. **YouTube Download Edge Function** (`supabase/functions/youtube-download/`):
   - Uses RapidAPI to convert YouTube videos to downloadable MP3/MP4
   - Requires `RAPIDAPI_KEY` secret

### How to Re-enable

1. In `teacher-content-manager.tsx`: Restore the Google Drive download URL field and document type option in lesson forms
2. In `custom-video-player.tsx`: Replace the playback speed control with the download button
3. In `course-player.$courseId.$lessonId.tsx`: Restore the download button above the video and the `canDownload` / `gdriveDownloadUrl` logic
4. Ensure `RAPIDAPI_KEY` is configured in Supabase Edge Function secrets if YouTube download is needed
