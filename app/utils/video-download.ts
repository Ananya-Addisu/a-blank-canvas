/**
 * Secure content download utility using Capacitor Filesystem.
 * Files are stored in the app's private directory (not accessible via file manager).
 * Only accessible through the app itself.
 * Supports videos and documents (PDF, DOC, PPT, etc.)
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

const VIDEOS_DIR = 'secure_videos';
const DOCS_DIR = 'secure_documents';
const VIDEO_MANIFEST = 'download_manifest.json';
const DOC_MANIFEST = 'doc_manifest.json';

export interface DownloadedVideo {
  id: string;
  lessonId: string;
  courseId: string;
  courseName: string;
  title: string;
  fileName: string;
  fileSize: number;
  downloadedAt: string;
  mimeType: string;
}

export interface DownloadedDocument {
  id: string;
  lessonId: string;
  courseId: string;
  courseName: string;
  title: string;
  fileName: string;
  fileSize: number;
  downloadedAt: string;
  mimeType: string;
  docType: string; // 'pdf', 'doc', 'ppt', etc.
}

interface DownloadManifest<T> {
  items: T[];
}

/**
 * Check if we're running on a native platform (Capacitor)
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Extract Google Drive file ID from various URL formats
 */
export function extractGDriveFileId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Check if a URL is a Google Drive URL
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
}

/**
 * Get the direct download URL for a Google Drive file
 */
export function getGDriveDownloadUrl(url: string): string | null {
  const fileId = extractGDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

// ==================== Generic Manifest Helpers ====================

async function readManifest<T>(dir: string, file: string): Promise<DownloadManifest<T>> {
  try {
    const result = await Filesystem.readFile({
      path: `${dir}/${file}`,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    const parsed = JSON.parse(result.data as string);
    // Support legacy format with "videos" key
    if (parsed.videos && !parsed.items) {
      return { items: parsed.videos };
    }
    return parsed;
  } catch {
    return { items: [] };
  }
}

async function writeManifest<T>(dir: string, file: string, manifest: DownloadManifest<T>): Promise<void> {
  await Filesystem.writeFile({
    path: `${dir}/${file}`,
    data: JSON.stringify(manifest),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
    recursive: true,
  });
}

function getVideoExtension(contentType?: string | null, url?: string): string {
  if (contentType?.includes('webm')) return 'webm';
  if (contentType?.includes('ogg')) return 'ogv';
  if (contentType?.includes('quicktime')) return 'mov';
  if (contentType?.includes('x-matroska')) return 'mkv';
  if (contentType?.includes('mp4')) return 'mp4';

  try {
    const pathname = new URL(url || '', 'https://magster.local').pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    if (ext && ext.length <= 5) return ext;
  } catch {
    // Ignore malformed URLs and use the default below.
  }

  return 'mp4';
}

async function fetchBlobWithProgress(
  url: string,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Download failed');

  if (!response.body) {
    const blob = await response.blob();
    onProgress?.(100);
    return blob;
  }

  const reader = response.body.getReader();
  const contentLength = Number(response.headers.get('content-length') || 0);
  const chunks: BlobPart[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    const normalizedValue = new Uint8Array(value.byteLength);
    normalizedValue.set(value);

    chunks.push(normalizedValue);
    received += normalizedValue.byteLength;

    if (contentLength > 0) {
      onProgress?.(Math.round((received / contentLength) * 100));
    }
  }

  onProgress?.(100);

  return new Blob(chunks, {
    type: response.headers.get('content-type') || 'video/mp4',
  });
}

// ==================== VIDEO DOWNLOADS ====================

/**
 * Download a video from Google Drive and store it securely
 */
export async function downloadVideo(
  url: string,
  lessonId: string,
  courseId: string,
  courseName: string,
  title: string,
  onProgress?: (progress: number) => void
): Promise<DownloadedVideo | null> {
  if (!isNativePlatform()) {
    console.warn('Video download is only available on native platforms');
    return null;
  }

  const downloadUrl = getGDriveDownloadUrl(url) || url;
  const fileName = `${lessonId}_${Date.now()}.mp4`;

  try {
    try {
      await Filesystem.mkdir({ path: VIDEOS_DIR, directory: Directory.Data, recursive: true });
    } catch { /* exists */ }

    onProgress?.(5);
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Download failed');

    onProgress?.(20);
    const blob = await response.blob();
    onProgress?.(60);

    const base64 = await blobToBase64(blob);
    onProgress?.(80);

    await Filesystem.writeFile({
      path: `${VIDEOS_DIR}/${fileName}`,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    onProgress?.(90);

    const video: DownloadedVideo = {
      id: crypto.randomUUID(),
      lessonId,
      courseId,
      courseName,
      title,
      fileName,
      fileSize: blob.size,
      downloadedAt: new Date().toISOString(),
      mimeType: blob.type || 'video/mp4',
    };

    const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
    manifest.items = manifest.items.filter(v => v.lessonId !== lessonId);
    manifest.items.push(video);
    await writeManifest(VIDEOS_DIR, VIDEO_MANIFEST, manifest);

    onProgress?.(100);
    return video;
  } catch (error) {
    console.error('Error downloading video:', error);
    return null;
  }
}

export async function downloadSecureLessonVideo(
  lessonId: string,
  studentId: string,
  courseId: string,
  courseName: string,
  title: string,
  onProgress?: (progress: number) => void
): Promise<DownloadedVideo | null> {
  if (!isNativePlatform()) {
    console.warn('Secure video download is only available on native platforms');
    return null;
  }

  try {
    try {
      await Filesystem.mkdir({ path: VIDEOS_DIR, directory: Directory.Data, recursive: true });
    } catch {
      // Directory already exists.
    }

    onProgress?.(5);

    const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'rpfhatpademhbcbrqtch';
    const endpoint = new URL(`https://${projectId}.supabase.co/functions/v1/serve-video`);
    endpoint.searchParams.set('lessonId', lessonId);
    if (studentId) endpoint.searchParams.set('studentId', studentId);

    const signedResponse = await fetch(endpoint.toString());
    if (!signedResponse.ok) {
      const data = await signedResponse.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to prepare secure download');
    }

    const { signedUrl } = await signedResponse.json();
    if (!signedUrl) throw new Error('Missing signed URL');

    onProgress?.(15);

    const blob = await fetchBlobWithProgress(signedUrl, (progress) => {
      onProgress?.(15 + Math.round(progress * 0.75));
    });

    const extension = getVideoExtension(blob.type, signedUrl);
    const fileName = `${lessonId}_${Date.now()}.${extension}`;
    const base64 = await blobToBase64(blob);
    const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
    const existing = manifest.items.find((item) => item.lessonId === lessonId);

    if (existing) {
      try {
        await Filesystem.deleteFile({
          path: `${VIDEOS_DIR}/${existing.fileName}`,
          directory: Directory.Data,
        });
      } catch {
        // Ignore stale file cleanup issues.
      }
    }

    onProgress?.(94);

    await Filesystem.writeFile({
      path: `${VIDEOS_DIR}/${fileName}`,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    const video: DownloadedVideo = {
      id: crypto.randomUUID(),
      lessonId,
      courseId,
      courseName,
      title,
      fileName,
      fileSize: blob.size,
      downloadedAt: new Date().toISOString(),
      mimeType: blob.type || 'video/mp4',
    };

    manifest.items = manifest.items.filter((item) => item.lessonId !== lessonId);
    manifest.items.push(video);
    await writeManifest(VIDEOS_DIR, VIDEO_MANIFEST, manifest);

    onProgress?.(100);
    return video;
  } catch (error) {
    console.error('Error downloading secure lesson video:', error);
    return null;
  }
}

export async function getDownloadedVideos(): Promise<DownloadedVideo[]> {
  if (!isNativePlatform()) return [];
  const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
  return manifest.items;
}

export async function isVideoDownloaded(lessonId: string): Promise<boolean> {
  if (!isNativePlatform()) return false;
  const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
  return manifest.items.some(v => v.lessonId === lessonId);
}

export async function getVideoFileUri(lessonId: string): Promise<string | null> {
  if (!isNativePlatform()) return null;
  const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
  const video = manifest.items.find(v => v.lessonId === lessonId);
  if (!video) return null;

  try {
    const result = await Filesystem.getUri({
      path: `${VIDEOS_DIR}/${video.fileName}`,
      directory: Directory.Data,
    });
    return Capacitor.convertFileSrc(result.uri);
  } catch {
    return null;
  }
}

export async function deleteDownloadedVideo(lessonId: string): Promise<boolean> {
  if (!isNativePlatform()) return false;

  const manifest = await readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST);
  const video = manifest.items.find(v => v.lessonId === lessonId);
  if (!video) return false;

  try {
    await Filesystem.deleteFile({
      path: `${VIDEOS_DIR}/${video.fileName}`,
      directory: Directory.Data,
    });
  } catch { /* file might not exist */ }

  manifest.items = manifest.items.filter(v => v.lessonId !== lessonId);
  await writeManifest(VIDEOS_DIR, VIDEO_MANIFEST, manifest);
  return true;
}

export async function clearAllDownloadedVideos(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Filesystem.rmdir({ path: VIDEOS_DIR, directory: Directory.Data, recursive: true });
  } catch { /* dir might not exist */ }
}

// ==================== DOCUMENT DOWNLOADS ====================

function getDocExtension(mimeType: string, url: string): string {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('msword')) return 'doc';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'xls';
  // Fallback to URL hint
  if (url.includes('.pdf')) return 'pdf';
  if (url.includes('.doc')) return 'doc';
  if (url.includes('.ppt')) return 'ppt';
  return 'pdf';
}

/**
 * Download a document from Google Drive and store it securely
 */
export async function downloadDocument(
  url: string,
  lessonId: string,
  courseId: string,
  courseName: string,
  title: string,
  onProgress?: (progress: number) => void
): Promise<DownloadedDocument | null> {
  if (!isNativePlatform()) {
    console.warn('Document download is only available on native platforms');
    return null;
  }

  const downloadUrl = getGDriveDownloadUrl(url) || url;

  try {
    try {
      await Filesystem.mkdir({ path: DOCS_DIR, directory: Directory.Data, recursive: true });
    } catch { /* exists */ }

    onProgress?.(5);
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Download failed');

    onProgress?.(20);
    const blob = await response.blob();
    onProgress?.(60);

    const ext = getDocExtension(blob.type, url);
    const fileName = `${lessonId}_${Date.now()}.${ext}`;

    const base64 = await blobToBase64(blob);
    onProgress?.(80);

    await Filesystem.writeFile({
      path: `${DOCS_DIR}/${fileName}`,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    onProgress?.(90);

    const doc: DownloadedDocument = {
      id: crypto.randomUUID(),
      lessonId,
      courseId,
      courseName,
      title,
      fileName,
      fileSize: blob.size,
      downloadedAt: new Date().toISOString(),
      mimeType: blob.type || 'application/pdf',
      docType: ext,
    };

    const manifest = await readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST);
    manifest.items = manifest.items.filter(d => d.lessonId !== lessonId);
    manifest.items.push(doc);
    await writeManifest(DOCS_DIR, DOC_MANIFEST, manifest);

    onProgress?.(100);
    return doc;
  } catch (error) {
    console.error('Error downloading document:', error);
    return null;
  }
}

export async function getDownloadedDocuments(): Promise<DownloadedDocument[]> {
  if (!isNativePlatform()) return [];
  const manifest = await readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST);
  return manifest.items;
}

export async function isDocumentDownloaded(lessonId: string): Promise<boolean> {
  if (!isNativePlatform()) return false;
  const manifest = await readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST);
  return manifest.items.some(d => d.lessonId === lessonId);
}

export async function getDocumentFileUri(lessonId: string): Promise<string | null> {
  if (!isNativePlatform()) return null;
  const manifest = await readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST);
  const doc = manifest.items.find(d => d.lessonId === lessonId);
  if (!doc) return null;

  try {
    const result = await Filesystem.getUri({
      path: `${DOCS_DIR}/${doc.fileName}`,
      directory: Directory.Data,
    });
    return Capacitor.convertFileSrc(result.uri);
  } catch {
    return null;
  }
}

export async function deleteDownloadedDocument(lessonId: string): Promise<boolean> {
  if (!isNativePlatform()) return false;

  const manifest = await readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST);
  const doc = manifest.items.find(d => d.lessonId === lessonId);
  if (!doc) return false;

  try {
    await Filesystem.deleteFile({
      path: `${DOCS_DIR}/${doc.fileName}`,
      directory: Directory.Data,
    });
  } catch { /* file might not exist */ }

  manifest.items = manifest.items.filter(d => d.lessonId !== lessonId);
  await writeManifest(DOCS_DIR, DOC_MANIFEST, manifest);
  return true;
}

export async function clearAllDownloadedDocuments(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Filesystem.rmdir({ path: DOCS_DIR, directory: Directory.Data, recursive: true });
  } catch { /* dir might not exist */ }
}

// ==================== STORAGE HELPERS ====================

export async function getStorageUsed(): Promise<number> {
  const [videoManifest, docManifest] = await Promise.all([
    readManifest<DownloadedVideo>(VIDEOS_DIR, VIDEO_MANIFEST),
    readManifest<DownloadedDocument>(DOCS_DIR, DOC_MANIFEST),
  ]);
  const videoSize = videoManifest.items.reduce((sum, v) => sum + v.fileSize, 0);
  const docSize = docManifest.items.reduce((sum, d) => sum + d.fileSize, 0);
  return videoSize + docSize;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Helper
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
