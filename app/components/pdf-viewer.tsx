import { useState, useEffect, useCallback } from "react";
import { 
  Download, Maximize, Minimize, Bookmark, BookmarkCheck, 
  ChevronLeft, ChevronRight, Search, X, List, Loader2, CheckCircle2
} from "lucide-react";
import { 
  getPDFBookmarks, addPDFBookmark, removePDFBookmark, 
  addDownloadedPDF, isDownloaded,
  type PDFBookmark 
} from "~/utils/local-storage";
import { 
  isNativePlatform, isGoogleDriveUrl, downloadDocument, 
  isDocumentDownloaded, deleteDownloadedDocument 
} from "~/utils/video-download";
import styles from "./pdf-viewer.module.css";

interface PDFViewerProps {
  fileUrl: string;
  title?: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  lessonId?: string;
}

export function PDFViewer({ fileUrl, title, className, courseId, courseName, lessonId }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarks, setBookmarks] = useState<PDFBookmark[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOfflineDownloaded, setIsOfflineDownloaded] = useState(false);

  const pdfId = lessonId || fileUrl;
  const isGDrive = isGoogleDriveUrl(fileUrl);
  const canDownloadOffline = isGDrive && isNativePlatform();

  useEffect(() => {
    setBookmarks(getPDFBookmarks(pdfId));
    if (lessonId) {
      setIsSaved(isDownloaded(lessonId));
      if (isGoogleDriveUrl(fileUrl)) {
        isDocumentDownloaded(lessonId).then(setIsOfflineDownloaded);
      }
    }
  }, [pdfId, lessonId, fileUrl]);

  // For PDFs, use Google Drive's built-in preview (works without login, hides download URL)
  const getEmbedUrl = (url: string) => {
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
    return url;
  };

  const getDownloadUrl = (url: string) => {
    const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(fileUrl);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    window.open(getDownloadUrl(fileUrl), '_blank');
  };

  const handleSaveForOffline = () => {
    if (!lessonId || isSaved) return;
    addDownloadedPDF({
      title: title || 'Untitled Document',
      fileUrl,
      courseId: courseId || '',
      courseName: courseName || '',
      lessonId,
    });
    setIsSaved(true);
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 2000);
  };

  const handleDownloadOffline = async () => {
    if (isDownloadingOffline || isOfflineDownloaded || !lessonId) return;
    setIsDownloadingOffline(true);
    setDownloadProgress(0);
    const result = await downloadDocument(
      fileUrl,
      lessonId,
      courseId || '',
      courseName || '',
      title || 'Document',
      setDownloadProgress
    );
    setIsDownloadingOffline(false);
    if (result) setIsOfflineDownloaded(true);
  };

  const handleDeleteOffline = async () => {
    if (!lessonId) return;
    await deleteDownloadedDocument(lessonId);
    setIsOfflineDownloaded(false);
  };

  const handleAddBookmark = () => {
    const label = `Bookmark ${bookmarks.length + 1}`;
    const newBookmark = addPDFBookmark(pdfId, bookmarks.length + 1, label);
    setBookmarks(prev => [...prev, newBookmark]);
  };

  const handleRemoveBookmark = (id: string) => {
    removePDFBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className={`${styles.container} ${isFullscreen ? styles.fullscreen : ''} ${className || ""}`}>
      <div className={styles.toolbar}>
        {title && <span className={styles.title}>{title}</span>}
        <div className={styles.controls}>
          {/* Bookmark current page */}
          <button
            onClick={handleAddBookmark}
            className={styles.controlButton}
            aria-label="Add bookmark"
            title="Add bookmark"
          >
            <Bookmark size={18} />
          </button>

          {/* View bookmarks */}
          {bookmarks.length > 0 && (
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`${styles.controlButton} ${showBookmarks ? styles.activeControl : ''}`}
              aria-label="View bookmarks"
              title={`${bookmarks.length} bookmark(s)`}
            >
              <List size={18} />
              <span className={styles.badgeCount}>{bookmarks.length}</span>
            </button>
          )}

          {/* Save / Download */}
          <button
            onClick={() => {
              if (lessonId && !isSaved) {
                handleSaveForOffline();
              }
              handleDownload();
            }}
            className={`${styles.controlButton} ${isSaved ? styles.activeControl : ''}`}
            aria-label="Download PDF"
            title={isSaved ? "Already saved" : "Download PDF"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Download size={18} />}
          </button>

          {/* Secure offline download (native only) */}
          {canDownloadOffline && (
            <button
              onClick={isOfflineDownloaded ? handleDeleteOffline : handleDownloadOffline}
              className={`${styles.controlButton} ${isOfflineDownloaded ? styles.activeControl : ''}`}
              disabled={isDownloadingOffline}
              aria-label={isOfflineDownloaded ? "Remove offline copy" : "Save for offline"}
              title={isOfflineDownloaded ? "Remove offline copy" : "Save for offline"}
            >
              {isDownloadingOffline ? (
                <Loader2 size={18} className={styles.spinIcon} />
              ) : isOfflineDownloaded ? (
                <CheckCircle2 size={18} />
              ) : (
                <Download size={18} />
              )}
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className={styles.controlButton}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      {/* Save confirmation toast */}
      {showSaveConfirm && (
        <div className={styles.saveToast}>
          <BookmarkCheck size={16} />
          <span>Saved to Downloads</span>
        </div>
      )}

      {/* Bookmarks panel */}
      {showBookmarks && bookmarks.length > 0 && (
        <div className={styles.bookmarksPanel}>
          <div className={styles.bookmarksPanelHeader}>
            <span>Bookmarks</span>
            <button onClick={() => setShowBookmarks(false)} className={styles.closePanelBtn}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.bookmarksList}>
            {bookmarks.map((bm) => (
              <div key={bm.id} className={styles.bookmarkItem}>
                <Bookmark size={14} />
                <span className={styles.bookmarkLabel}>{bm.label || `Page ${bm.pageNumber}`}</span>
                <button 
                  onClick={() => handleRemoveBookmark(bm.id)} 
                  className={styles.removeBookmarkBtn}
                  aria-label="Remove bookmark"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.viewerContainer}>
        <iframe
          src={embedUrl}
          className={styles.iframe}
          title={title || "PDF Document"}
          allow="autoplay; clipboard-write; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-storage-access-by-user-activation"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
