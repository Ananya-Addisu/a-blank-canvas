/**
 * Local storage utilities for downloads, bookmarks, and highlights
 */

// Types
export interface DownloadedPDF {
  id: string;
  title: string;
  fileUrl: string;
  courseId: string;
  courseName: string;
  lessonId: string;
  downloadedAt: string;
  fileSize?: number;
  thumbnailUrl?: string;
}

export interface VideoBookmark {
  id: string;
  title: string;
  videoUrl: string;
  courseId: string;
  courseName: string;
  lessonId: string;
  savedAt: string;
  thumbnailUrl?: string;
}

export interface PDFBookmark {
  id: string;
  pdfId: string;
  pageNumber: number;
  label?: string;
  createdAt: string;
}

export interface PDFHighlight {
  id: string;
  pdfId: string;
  pageNumber: number;
  text: string;
  color: string;
  createdAt: string;
}

export interface LibraryBookmark {
  id: string;
  itemId: string;
  title: string;
  subject: string;
  author: string;
  contentType: string;
  savedAt: string;
}

// Storage keys
const KEYS = {
  DOWNLOADED_PDFS: 'etb_downloaded_pdfs',
  VIDEO_BOOKMARKS: 'etb_video_bookmarks',
  PDF_BOOKMARKS: 'etb_pdf_bookmarks',
  PDF_HIGHLIGHTS: 'etb_pdf_highlights',
  LIBRARY_BOOKMARKS: 'etb_library_bookmarks',
} as const;

// Generic helpers
function getItems<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// Downloaded PDFs
export function getDownloadedPDFs(): DownloadedPDF[] {
  return getItems<DownloadedPDF>(KEYS.DOWNLOADED_PDFS);
}

export function addDownloadedPDF(pdf: Omit<DownloadedPDF, 'id' | 'downloadedAt'>): DownloadedPDF {
  const items = getDownloadedPDFs();
  // Avoid duplicates by lessonId
  const existing = items.find(p => p.lessonId === pdf.lessonId);
  if (existing) return existing;

  const newItem: DownloadedPDF = {
    ...pdf,
    id: crypto.randomUUID(),
    downloadedAt: new Date().toISOString(),
  };
  setItems(KEYS.DOWNLOADED_PDFS, [...items, newItem]);
  return newItem;
}

export function removeDownloadedPDF(id: string): void {
  const items = getDownloadedPDFs().filter(p => p.id !== id);
  setItems(KEYS.DOWNLOADED_PDFS, items);
}

export function isDownloaded(lessonId: string): boolean {
  return getDownloadedPDFs().some(p => p.lessonId === lessonId);
}

// Video Bookmarks
export function getVideoBookmarks(): VideoBookmark[] {
  return getItems<VideoBookmark>(KEYS.VIDEO_BOOKMARKS);
}

export function addVideoBookmark(bookmark: Omit<VideoBookmark, 'id' | 'savedAt'>): VideoBookmark {
  const items = getVideoBookmarks();
  const existing = items.find(b => b.lessonId === bookmark.lessonId);
  if (existing) return existing;

  const newItem: VideoBookmark = {
    ...bookmark,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  setItems(KEYS.VIDEO_BOOKMARKS, [...items, newItem]);
  return newItem;
}

export function removeVideoBookmark(id: string): void {
  const items = getVideoBookmarks().filter(b => b.id !== id);
  setItems(KEYS.VIDEO_BOOKMARKS, items);
}

export function isVideoBookmarked(lessonId: string): boolean {
  return getVideoBookmarks().some(b => b.lessonId === lessonId);
}

// PDF Bookmarks (per-document page bookmarks)
export function getPDFBookmarks(pdfId: string): PDFBookmark[] {
  return getItems<PDFBookmark>(KEYS.PDF_BOOKMARKS).filter(b => b.pdfId === pdfId);
}

export function addPDFBookmark(pdfId: string, pageNumber: number, label?: string): PDFBookmark {
  const items = getItems<PDFBookmark>(KEYS.PDF_BOOKMARKS);
  const existing = items.find(b => b.pdfId === pdfId && b.pageNumber === pageNumber);
  if (existing) return existing;

  const newItem: PDFBookmark = {
    id: crypto.randomUUID(),
    pdfId,
    pageNumber,
    label,
    createdAt: new Date().toISOString(),
  };
  setItems(KEYS.PDF_BOOKMARKS, [...items, newItem]);
  return newItem;
}

export function removePDFBookmark(id: string): void {
  const items = getItems<PDFBookmark>(KEYS.PDF_BOOKMARKS).filter(b => b.id !== id);
  setItems(KEYS.PDF_BOOKMARKS, items);
}

// PDF Highlights
export function getPDFHighlights(pdfId: string): PDFHighlight[] {
  return getItems<PDFHighlight>(KEYS.PDF_HIGHLIGHTS).filter(h => h.pdfId === pdfId);
}

export function addPDFHighlight(pdfId: string, pageNumber: number, text: string, color: string = '#ffeb3b'): PDFHighlight {
  const items = getItems<PDFHighlight>(KEYS.PDF_HIGHLIGHTS);
  const newItem: PDFHighlight = {
    id: crypto.randomUUID(),
    pdfId,
    pageNumber,
    text,
    color,
    createdAt: new Date().toISOString(),
  };
  setItems(KEYS.PDF_HIGHLIGHTS, [...items, newItem]);
  return newItem;
}

export function removePDFHighlight(id: string): void {
  const items = getItems<PDFHighlight>(KEYS.PDF_HIGHLIGHTS).filter(h => h.id !== id);
  setItems(KEYS.PDF_HIGHLIGHTS, items);
}

// Library Bookmarks
export function getLibraryBookmarks(): LibraryBookmark[] {
  return getItems<LibraryBookmark>(KEYS.LIBRARY_BOOKMARKS);
}

export function addLibraryBookmark(bookmark: Omit<LibraryBookmark, 'id' | 'savedAt'>): LibraryBookmark {
  const items = getLibraryBookmarks();
  const existing = items.find(b => b.itemId === bookmark.itemId);
  if (existing) return existing;

  const newItem: LibraryBookmark = {
    ...bookmark,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  setItems(KEYS.LIBRARY_BOOKMARKS, [...items, newItem]);
  return newItem;
}

export function removeLibraryBookmark(id: string): void {
  const items = getLibraryBookmarks().filter(b => b.id !== id);
  setItems(KEYS.LIBRARY_BOOKMARKS, items);
}

export function isLibraryBookmarked(itemId: string): boolean {
  return getLibraryBookmarks().some(b => b.itemId === itemId);
}

// Clear all local data
export function clearAllLocalData(): void {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
}
