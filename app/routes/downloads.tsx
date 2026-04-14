import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { 
  ChevronLeft, FileText, Video, PlayCircle, 
  Trash2, Search, BookOpen, Download, Book
} from "lucide-react";
import { Input } from "~/components/ui/input/input";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { OfflineBanner } from "~/components/offline-banner";
import { LoadingScreen } from "~/components/loading-screen";
import { CustomVideoPlayer } from "~/components/custom-video-player";
import { useIsNativePlatform } from "~/hooks/use-is-native";
import { useOnlineStatus } from "~/hooks/use-online-status";
import { 
  getDownloadedPDFs, removeDownloadedPDF,
  getVideoBookmarks, removeVideoBookmark,
  getLibraryBookmarks, removeLibraryBookmark,
  type DownloadedPDF, type VideoBookmark, type LibraryBookmark
} from "~/utils/local-storage";
import {
  deleteDownloadedVideo,
  getDownloadedVideos,
  getVideoFileUri,
  type DownloadedVideo,
} from "~/utils/video-download";
import { libraryMarkdownItems } from "~/data/library-content";
import styles from "./downloads.module.css";

type SavedVideoItem =
  | { kind: 'offline'; data: DownloadedVideo; timestamp: string }
  | { kind: 'bookmark'; data: VideoBookmark; timestamp: string };

export default function Downloads() {
  const isOnline = useOnlineStatus();
  const isNative = useIsNativePlatform();
  const [activeTab, setActiveTab] = useState<'library' | 'videos' | 'documents'>('library');
  const [pdfs, setPdfs] = useState<DownloadedPDF[]>([]);
  const [videos, setVideos] = useState<VideoBookmark[]>([]);
  const [downloadedVideos, setDownloadedVideos] = useState<DownloadedVideo[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryBookmark[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [readingItem, setReadingItem] = useState<string | null>(null);
  const [readingDoc, setReadingDoc] = useState<DownloadedPDF | null>(null);
  const [readingVideo, setReadingVideo] = useState<DownloadedVideo | null>(null);
  const [readingVideoUrl, setReadingVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    setPdfs(getDownloadedPDFs());
    setVideos(getVideoBookmarks());
    setLibraryItems(getLibraryBookmarks());
  }, []);

  useEffect(() => {
    if (isNative !== true) {
      setDownloadedVideos([]);
      return;
    }

    void getDownloadedVideos().then(setDownloadedVideos);
  }, [isNative]);

  const handleRemovePDF = (id: string) => {
    removeDownloadedPDF(id);
    setPdfs(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveVideoBookmark = (id: string) => {
    removeVideoBookmark(id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleRemoveDownloadedVideo = async (lessonId: string) => {
    await deleteDownloadedVideo(lessonId);
    setDownloadedVideos(prev => prev.filter(video => video.lessonId !== lessonId));

    if (readingVideo?.lessonId === lessonId) {
      setReadingVideo(null);
      setReadingVideoUrl(null);
    }
  };

  const handleRemoveLibrary = (id: string) => {
    removeLibraryBookmark(id);
    setLibraryItems(prev => prev.filter(l => l.id !== id));
    if (readingItem) setReadingItem(null);
  };

  const filteredPDFs = pdfs.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDownloadedVideos = downloadedVideos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLibrary = libraryItems.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideoItems = useMemo<SavedVideoItem[]>(() => {
    const offlineItems: SavedVideoItem[] = filteredDownloadedVideos.map((video) => ({
      kind: 'offline',
      data: video,
      timestamp: video.downloadedAt,
    }));

    const bookmarkedItems: SavedVideoItem[] = filteredVideos.map((video) => ({
      kind: 'bookmark',
      data: video,
      timestamp: video.savedAt,
    }));

    return [...offlineItems, ...bookmarkedItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [filteredDownloadedVideos, filteredVideos]);

  const handlePlayDownloadedVideo = async (video: DownloadedVideo) => {
    setReadingVideo(video);
    setReadingVideoUrl(null);

    const fileUrl = await getVideoFileUri(video.lessonId);
    if (!fileUrl) {
      setReadingVideo(null);
      return;
    }

    setReadingVideoUrl(fileUrl);
  };

  // Reading view for library item
  if (readingItem) {
    const mdItem = libraryMarkdownItems.find(i => i.id === readingItem);
    if (mdItem) {
      return (
        <div className={styles.container}>
          <header className={styles.header}>
            <button onClick={() => setReadingItem(null)} className={styles.backButton}>
              <ChevronLeft size={24} />
              <span>Back</span>
            </button>
            <h1 className={styles.headerTitle}>{mdItem.title}</h1>
            <div style={{ width: 40 }} />
          </header>
          <main className={styles.readerMain}>
            <MarkdownRenderer content={mdItem.markdown} />
          </main>
        </div>
      );
    }
  }

  // Reading view for course document
  if (readingDoc) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => setReadingDoc(null)} className={styles.backButton}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </button>
          <h1 className={styles.headerTitle}>{readingDoc.title}</h1>
          <div style={{ width: 40 }} />
        </header>
        <main className={styles.readerMain}>
          <MarkdownRenderer content={readingDoc.fileUrl || ''} />
        </main>
      </div>
    );
  }

  if (readingVideo) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={() => {
            setReadingVideo(null);
            setReadingVideoUrl(null);
          }} className={styles.backButton}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </button>
          <h1 className={styles.headerTitle}>{readingVideo.title}</h1>
          <div style={{ width: 40 }} />
        </header>
        <main className={styles.readerMain}>
          {!readingVideoUrl ? (
            <LoadingScreen />
          ) : (
            <div className={styles.offlineVideoShell}>
              <CustomVideoPlayer
                videoUrl={readingVideoUrl}
                title={readingVideo.title}
                autoPlay
              />
              <p className={styles.offlineVideoMeta}>
                {readingVideo.courseName} - Downloaded {new Date(readingVideo.downloadedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => window.history.back()} className={styles.backButton}>
          <ChevronLeft size={24} />
          <span>Back</span>
        </button>
        <h1 className={styles.headerTitle}>Downloads</h1>
        <div style={{ width: 40 }} />
      </header>
      <OfflineBanner />
      <main className={styles.main}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <Book size={16} />
            <span>Library</span>
            <span className={styles.tabCount}>{libraryItems.length}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'videos' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('videos')}
          >
            <Video size={16} />
            <span>Videos</span>
            <span className={styles.tabCount}>{videos.length + downloadedVideos.length}</span>
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'documents' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            <FileText size={16} />
            <span>Documents</span>
            <span className={styles.tabCount}>{pdfs.length}</span>
          </button>
        </div>

        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <Input
            type="search"
            placeholder={`Search ${activeTab} downloads...`}
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'library' && (
          <div className={styles.list}>
            {filteredLibrary.length === 0 ? (
              <div className={styles.emptyState}>
                <Book size={48} />
                <p>No saved library items yet. Save items from the Library to access them here.</p>
              </div>
            ) : (
              filteredLibrary.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Book size={24} />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <button onClick={() => handleRemoveLibrary(item.id)} className={styles.removeBtn} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={styles.cardMeta}>
                      {item.subject} - {item.author} - Saved {new Date(item.savedAt).toLocaleDateString()}
                    </p>
                    <div className={styles.cardActions}>
                      <button 
                        onClick={() => setReadingItem(item.itemId)}
                        className={`${styles.actionBtn} ${styles.primaryAction}`}
                      >
                        <BookOpen size={14} />
                        Read
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className={styles.list}>
            {filteredVideoItems.length === 0 ? (
              <div className={styles.emptyState}>
                <Download size={48} />
                <p>No saved videos yet. Save YouTube and Google Drive videos, or download uploaded videos, to access them here.</p>
              </div>
            ) : (
              filteredVideoItems.map((item) => {
                if (item.kind === 'offline') {
                  const video = item.data;

                  return (
                    <div key={`offline-${video.lessonId}`} className={styles.card}>
                      <div className={`${styles.cardIcon} ${styles.videoIcon}`}>
                        <PlayCircle size={24} />
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <h3 className={styles.cardTitle}>{video.title}</h3>
                          <button
                            onClick={() => void handleRemoveDownloadedVideo(video.lessonId)}
                            className={styles.removeBtn}
                            aria-label="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className={styles.cardMeta}>
                          {video.courseName} - Downloaded {new Date(video.downloadedAt).toLocaleDateString()}
                        </p>
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => void handlePlayDownloadedVideo(video)}
                            className={`${styles.actionBtn} ${styles.primaryAction}`}
                          >
                            <PlayCircle size={14} />
                            Play Offline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                const video = item.data;

                return (
                  <div key={video.id} className={styles.card}>
                    <div className={`${styles.cardIcon} ${styles.videoIcon}`}>
                      <PlayCircle size={24} />
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <h3 className={styles.cardTitle}>{video.title}</h3>
                        <button
                          onClick={() => handleRemoveVideoBookmark(video.id)}
                          className={styles.removeBtn}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className={styles.cardMeta}>
                        {video.courseName} - Saved {new Date(video.savedAt).toLocaleDateString()}
                      </p>
                      <div className={styles.cardActions}>
                        {isOnline ? (
                          <Link
                            to={`/course-player/${video.courseId}/${video.lessonId}`}
                            className={`${styles.actionBtn} ${styles.primaryAction}`}
                          >
                            <PlayCircle size={14} />
                            Watch
                          </Link>
                        ) : (
                          <button className={`${styles.actionBtn} ${styles.disabledAction}`} disabled>
                            <PlayCircle size={14} />
                            Go Online
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.list}>
            {filteredPDFs.length === 0 ? (
              <div className={styles.emptyState}>
                <BookOpen size={48} />
                <p>No saved documents yet. Save documents from your course lessons to read them here.</p>
              </div>
            ) : (
              filteredPDFs.map((pdf) => (
                <div key={pdf.id} className={styles.card}>
                  <div className={styles.cardIcon}>
                    <FileText size={24} />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h3 className={styles.cardTitle}>{pdf.title}</h3>
                      <button onClick={() => handleRemovePDF(pdf.id)} className={styles.removeBtn} aria-label="Remove">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className={styles.cardMeta}>
                      {pdf.courseName} - Saved {new Date(pdf.downloadedAt).toLocaleDateString()}
                    </p>
                    <div className={styles.cardActions}>
                      <button 
                        onClick={() => setReadingDoc(pdf)}
                        className={`${styles.actionBtn} ${styles.primaryAction}`}
                      >
                        <BookOpen size={14} />
                        Read
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}