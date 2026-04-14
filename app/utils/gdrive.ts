/**
 * Google Drive video URL utilities
 */

/**
 * Extracts the file ID from various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/file/d/FILE_ID/...
 */
export function extractGDriveFileId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Converts a Google Drive URL to an embeddable preview URL
 */
export function convertToGDriveEmbedUrl(url: string): string | null {
  const fileId = extractGDriveFileId(url);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function isValidGDriveUrl(url: string): boolean {
  return !!extractGDriveFileId(url);
}
