/**
 * Utility functions for YouTube URL validation and processing
 */

/**
 * Validates if a URL is a valid YouTube URL
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 */
// Fix #10: Support all YouTube URL formats including youtu.be/ID?si=..., youtube.com/ID, etc.
export function isValidYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)?|youtu\.be\/)[\w-]{11}([?&].*)?$/;
  return youtubeRegex.test(url.trim());
}

/**
 * Extracts the video ID from a YouTube URL
 */
// Fix #10: Extract video ID from all YouTube URL formats
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&?\s]{11})/,
    /(?:youtu\.be\/)([^&?\s]{11})/,
    /(?:youtube\.com\/embed\/)([^&?\s]{11})/,
    /(?:youtube\.com\/shorts\/)([^&?\s]{11})/,
    /(?:youtube\.com\/)([^&?\s\/]{11})(?:[?&]|$)/,  // youtube.com/VIDEO_ID format
    /^([^&?\s]{11})$/, // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Converts any YouTube URL to an embed URL
 */
export function convertToEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Gets the thumbnail URL for a YouTube video
 */
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' | 'max' = 'high'): string | null {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return null;

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    max: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}

/**
 * Alias for extractYouTubeVideoId for compatibility
 */
export function extractYouTubeId(url: string): string | null {
  return extractYouTubeVideoId(url);
}

/**
 * Validates and formats a YouTube URL for storage
 */
export function validateAndFormatYouTubeUrl(url: string): { 
  isValid: boolean; 
  embedUrl: string | null; 
  thumbnailUrl: string | null;
  videoId: string | null;
  error?: string;
} {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      embedUrl: null,
      thumbnailUrl: null,
      videoId: null,
      error: 'URL is required',
    };
  }

  const trimmedUrl = url.trim();
  
  if (!isValidYouTubeUrl(trimmedUrl)) {
    return {
      isValid: false,
      embedUrl: null,
      thumbnailUrl: null,
      videoId: null,
      error: 'Invalid YouTube URL. Please provide a valid YouTube video URL.',
    };
  }

  const videoId = extractYouTubeVideoId(trimmedUrl);
  const embedUrl = convertToEmbedUrl(trimmedUrl);
  const thumbnailUrl = getYouTubeThumbnail(trimmedUrl);

  return {
    isValid: true,
    embedUrl,
    thumbnailUrl,
    videoId,
  };
}
