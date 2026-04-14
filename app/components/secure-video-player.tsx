import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Eye, EyeOff, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router";
import TextLoading from "~/components/ui/text-loading/text-loading";
import styles from "./custom-video-player.module.css";

interface SecureVideoPlayerProps {
  lessonId?: string;
  libraryContentId?: string;
  studentId?: string;
  studentName?: string;
  title?: string;
  className?: string;
  onVideoEnd?: () => void;
  showBackButton?: boolean;
  showDownload?: boolean;
  onDownloadStart?: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SecureVideoPlayer({
  lessonId, libraryContentId, studentId, studentName, title, className, onVideoEnd,
  showBackButton = false, showDownload = false, onDownloadStart,
}: SecureVideoPlayerProps) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cleanView, setCleanView] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [buffered, setBuffered] = useState(0);

  const buildServeVideoUrl = useCallback(() => {
    const projectId = (import.meta as any).env?.VITE_SUPABASE_PROJECT_ID || 'rpfhatpademhbcbrqtch';
    const endpoint = new URL(`https://${projectId}.supabase.co/functions/v1/serve-video`);
    if (lessonId) endpoint.searchParams.set('lessonId', lessonId);
    if (libraryContentId) endpoint.searchParams.set('libraryContentId', libraryContentId);
    if (studentId) endpoint.searchParams.set('studentId', studentId);
    return endpoint.toString();
  }, [lessonId, libraryContentId, studentId]);

  // Fetch signed URL and use it as streaming src (buffered like YouTube)
  useEffect(() => {
    let cancelled = false;
    const fetchUrl = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(buildServeVideoUrl());
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to get video');
        }
        const { signedUrl } = await res.json();
        if (!cancelled) {
          setStreamUrl(signedUrl);
          // isLoading will be set to false on canplay event
        }
      } catch (err: any) {
        if (!cancelled) { setError(err.message || 'Failed to load video'); setIsLoading(false); }
      }
    };
    fetchUrl();
    return () => { cancelled = true; };
  }, [buildServeVideoUrl]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(fs);
      if (!fs) { setIsFakeFullscreen(false); setCleanView(false); try { (screen.orientation as any).unlock(); } catch {} }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFakeFullscreen) { setIsFakeFullscreen(false); setIsFullscreen(false); setCleanView(false); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFakeFullscreen]);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  const toggleFullscreen = async () => {
    if (isFullscreen || isFakeFullscreen) {
      try { if (document.fullscreenElement) await document.exitFullscreen(); else if ((document as any).webkitFullscreenElement) await (document as any).webkitExitFullscreen(); } catch {}
      setIsFakeFullscreen(false); setIsFullscreen(false); setCleanView(false);
      try { (screen.orientation as any).unlock(); } catch {} return;
    }
    try {
      if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
      else if ((containerRef.current as any)?.webkitRequestFullscreen) await (containerRef.current as any).webkitRequestFullscreen();
      else { setIsFakeFullscreen(true); setIsFullscreen(true); }
    } catch { setIsFakeFullscreen(true); setIsFullscreen(true); }
    try { await (screen.orientation as any).lock('landscape'); } catch {}
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return; const t = Number(e.target.value); videoRef.current.currentTime = t; setCurrentTime(t);
  };
  const skip = (s: number) => { if (!videoRef.current) return; videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + s)); };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return; const v = Number(e.target.value); videoRef.current.volume = v / 100; setVolume(v);
    if (v === 0) setIsMuted(true); else if (isMuted) setIsMuted(false);
  };
  const cyclePlaybackSpeed = () => {
    const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed); const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
    setPlaybackSpeed(next); if (videoRef.current) videoRef.current.playbackRate = next;
  };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return; const rect = e.currentTarget.getBoundingClientRect();
    videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const updateBuffered = () => {
    if (!videoRef.current || !duration) return;
    const buf = videoRef.current.buffered;
    if (buf.length > 0) setBuffered((buf.end(buf.length - 1) / duration) * 100);
  };

  const handleDownload = async () => {
    if (!streamUrl || downloadProgress !== null) return;
    setDownloadProgress(0); onDownloadStart?.();
    try {
      const res = await fetch(buildServeVideoUrl());
      const { signedUrl } = await res.json();
      const videoRes = await fetch(signedUrl);
      const reader = videoRes.body?.getReader();
      const contentLength = Number(videoRes.headers.get('content-length') || 0);
      const chunks: Uint8Array[] = []; let received = 0;
      if (reader) { while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); received += value.length; if (contentLength > 0) setDownloadProgress(Math.round((received / contentLength) * 100)); } }
      const blob = new Blob(chunks as any, { type: 'video/mp4' });
      const resourceKey = lessonId || libraryContentId || 'video';
      const encKey = `magster-${studentId}-${resourceKey}`;
      const arrayBuf = await blob.arrayBuffer(); const view = new Uint8Array(arrayBuf);
      for (let i = 0; i < view.length; i++) view[i] ^= encKey.charCodeAt(i % encKey.length);
      const encBlob = new Blob([view.buffer as ArrayBuffer], { type: 'application/octet-stream' });
      const dbReq = indexedDB.open('magster-downloads', 1);
      dbReq.onupgradeneeded = () => { const db = dbReq.result; if (!db.objectStoreNames.contains('videos')) db.createObjectStore('videos', { keyPath: 'id' }); };
       dbReq.onsuccess = () => { const db = dbReq.result; const tx = db.transaction('videos', 'readwrite'); tx.objectStore('videos').put({ id: resourceKey, blob: encBlob, title: title || 'Video', studentId, downloadedAt: new Date().toISOString(), size: blob.size }); tx.oncomplete = () => setDownloadProgress(100); };
    } catch { setDownloadProgress(null); }
  };

  const isInFullscreen = isFakeFullscreen || isFullscreen;

  if (isLoading && !streamUrl) {
    return (
      <div className={`${styles.playerContainer} ${className || ""}`}>
        <div className={styles.loading}>
          <TextLoading texts={["Loading secure video...", "Verifying access...", "Preparing stream...", "Almost ready..."]} interval={1500} />
        </div>
      </div>
    );
  }

  if (error) {
    return (<div className={`${styles.errorContainer} ${className || ""}`}><p>{error}</p></div>);
  }

  return (
    <div ref={containerRef} className={`${styles.playerContainer} ${isFakeFullscreen ? styles.fakeFullscreen : ''} ${className || ""}`} onContextMenu={e => e.preventDefault()}>
      <div className={styles.playerWrapper}>
        {showBackButton && isInFullscreen && (
          <button className={styles.backButton} onClick={() => { toggleFullscreen(); navigate(-1); }} aria-label="Go back"><ArrowLeft size={20} /></button>
        )}
        <video
          ref={videoRef}
          src={streamUrl || undefined}
          className={styles.iframe}
          style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          playsInline autoPlay preload="auto"
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          onCanPlay={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => { setCurrentTime(videoRef.current?.currentTime || 0); updateBuffered(); }}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onProgress={updateBuffered}
          onEnded={onVideoEnd}
          onWaiting={() => {}}
        />
        <div className={styles.pointerBlocker} onClick={togglePlay} />

        {isLoading && (
          <div className={styles.loading}>
            <TextLoading texts={["Buffering...", "Loading...", "Almost ready..."]} interval={1200} />
          </div>
        )}

        {studentName && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.08, fontSize: '24px', fontWeight: 700, color: 'white', transform: 'rotate(-30deg)', userSelect: 'none', letterSpacing: '4px' }}>
            {studentName}
          </div>
        )}
      </div>

      {isInFullscreen && cleanView && (
        <button className={styles.showControlsBtn} onClick={() => setCleanView(false)} aria-label="Show controls"><Eye size={18} /></button>
      )}

      <div className={`${styles.controlsWrapper} ${isInFullscreen && cleanView ? styles.controlsHidden : ''}`}>
        <div className={styles.progressBar} onClick={handleProgressBarClick}>
          <div className={styles.progressTrack}>
            {/* Buffer bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${buffered}%`, background: 'rgba(255,255,255,0.25)', borderRadius: 'inherit', transition: 'width 0.3s' }} />
            <div className={styles.progressFill} style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
            <div className={styles.progressThumb} style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          </div>
          <input type="range" min="0" max={duration} value={currentTime} onChange={handleSeek} className={styles.seekBar} />
        </div>

        <div className={styles.controls}>
          <div className={styles.leftControls}>
            <button onClick={togglePlay} className={styles.controlButton} aria-label={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <div className={styles.volumeControl}>
              <button onClick={toggleMute} className={styles.controlButton} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input type="range" min="0" max="100" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className={styles.volumeSlider} />
            </div>
            <div className={styles.timePill}><span>{formatTime(currentTime)}</span><span className={styles.timeSeparator}>/</span><span>{formatTime(duration)}</span></div>
            <button onClick={() => skip(-10)} className={styles.controlButton} aria-label="Skip back 10s"><SkipBack size={18} /></button>
            <button onClick={() => skip(10)} className={styles.controlButton} aria-label="Skip forward 10s"><SkipForward size={18} /></button>
          </div>
          <div className={styles.rightControls}>
            {title && <span className={styles.videoTitle}>{title}</span>}
            {showDownload && (
              <button onClick={handleDownload} className={styles.controlButton} aria-label="Download" title="Download for offline">
                {downloadProgress !== null && downloadProgress < 100 ? <span style={{ fontSize: '11px', fontWeight: 700 }}>{downloadProgress}%</span> : downloadProgress === 100 ? <span style={{ fontSize: '11px', fontWeight: 700 }}>✓</span> : <Download size={18} />}
              </button>
            )}
            <button onClick={cyclePlaybackSpeed} className={styles.speedButton} aria-label="Speed" title={`Speed: ${playbackSpeed}x`}>{playbackSpeed}x</button>
            {isInFullscreen && (<button onClick={() => setCleanView(true)} className={styles.controlButton} aria-label="Clean view" title="Hide controls"><EyeOff size={18} /></button>)}
            <button onClick={toggleFullscreen} className={styles.controlButton} aria-label="Fullscreen">{isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
