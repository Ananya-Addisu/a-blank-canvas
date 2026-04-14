//these are the fix codes from this file
import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, SkipBack, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { extractYouTubeId } from "~/utils/youtube";
import { extractGDriveFileId } from "~/utils/gdrive";
import TextLoading from "~/components/ui/text-loading/text-loading";
import styles from "./custom-video-player.module.css";

interface CustomVideoPlayerProps {
  videoUrl: string;
  gdriveUrl?: string;
  title?: string;
  className?: string;
  onVideoEnd?: () => void;
  autoPlay?: boolean;
  showBackButton?: boolean;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function CustomVideoPlayer({ videoUrl, gdriveUrl, title, className, onVideoEnd, autoPlay = true, showBackButton = false }: CustomVideoPlayerProps) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [cleanView, setCleanView] = useState(false);
  const [useGdriveFallback, setUseGdriveFallback] = useState(false);
  const playerRef = useRef<any>(null);
  const html5VideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const videoId = extractYouTubeId(videoUrl);
  
  // Determine if we have a Google Drive fallback URL
  const gdriveFileId = gdriveUrl ? extractGDriveFileId(gdriveUrl) : (!videoId ? extractGDriveFileId(videoUrl) : null);
  
  // If no YouTube ID and no gdrive fallback, check if videoUrl itself is a GDrive URL
  const isDirectGdrive = !videoId && !!gdriveFileId && !gdriveUrl;
  
  // Show GDrive iframe when: fallback triggered, or direct gdrive URL with no YouTube
  const showGdriveEmbed = useGdriveFallback || isDirectGdrive;
  const activeGdriveFileId = gdriveFileId;

  // Direct upload: not YouTube, not GDrive — treat as HTML5 <video>
  const isDirectUpload = !videoId && !gdriveFileId && !!videoUrl;

  // Reset fallback state when URLs change
  useEffect(() => {
    setUseGdriveFallback(false);
    setVideoError(false);
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [videoUrl, gdriveUrl]);

  // YouTube player setup
  useEffect(() => {
    if (!videoId || showGdriveEmbed) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && videoId) {
        playerRef.current = new window.YT.Player(`player-${videoId}`, {
          videoId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            disablekb: 1,
            playsinline: 1,
            autoplay: 1,
            mute: 0,
          },
          events: {
            onReady: (event: any) => {
              setIsReady(true);
              setDuration(event.target.getDuration());
              setVolume(event.target.getVolume());
              event.target.unMute();
              event.target.setVolume(100);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              if (event.data === window.YT.PlayerState.PLAYING) {
                startProgressTracking();
              } else {
                stopProgressTracking();
              }
              if (event.data === window.YT.PlayerState.ENDED && onVideoEnd) {
                onVideoEnd();
              }
            },
            onError: (event: any) => {
              // YouTube errors: 2=invalid param, 5=HTML5 error, 100=not found, 101/150=restricted
              console.error('[YT] Player error code:', event.data);
              if (activeGdriveFileId) {
                // Switch to Google Drive fallback
                console.log('[YT] Switching to Google Drive fallback');
                setUseGdriveFallback(true);
                setIsReady(false);
                setVideoError(false);
              } else {
                setVideoError(true);
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, showGdriveEmbed]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      setIsFullscreen(fs);
      if (!fs) {
        setIsFakeFullscreen(false);
        setCleanView(false);
        try { (screen.orientation as any).unlock(); } catch { }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFakeFullscreen) {
        setIsFakeFullscreen(false);
        setIsFullscreen(false);
        setCleanView(false);
        try { (screen.orientation as any).unlock(); } catch { }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFakeFullscreen]);

  const startProgressTracking = () => {
    if (progressIntervalRef.current) return;
    progressIntervalRef.current = window.setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 100);
  };

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen || isFakeFullscreen) {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen();
        }
      } catch { }
      setIsFakeFullscreen(false);
      setIsFullscreen(false);
      setCleanView(false);
      try { (screen.orientation as any).unlock(); } catch { }
      return;
    }

    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any)?.webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      } else {
        setIsFakeFullscreen(true);
        setIsFullscreen(true);
      }
    } catch {
      setIsFakeFullscreen(true);
      setIsFullscreen(true);
    }

    try {
      await (screen.orientation as any).lock('landscape');
    } catch { }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (!playerRef.current) return;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const skip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    if (!playerRef.current) return;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (!playerRef.current) return;
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const cyclePlaybackSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    const newSpeed = PLAYBACK_SPEEDS[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (playerRef.current?.setPlaybackRate) {
      playerRef.current.setPlaybackRate(newSpeed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    if (!playerRef.current) return;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  // ── Google Drive embed (iframe with Google's own player) ──
  if (showGdriveEmbed && activeGdriveFileId) {
    const embedUrl = `https://drive.google.com/file/d/${activeGdriveFileId}/preview`;
    const isInFullscreen = isFakeFullscreen || isFullscreen;

    return (
      <div ref={containerRef} className={`${styles.playerContainer} ${isFakeFullscreen ? styles.fakeFullscreen : ''} ${className || ""}`}>
        <div className={styles.playerWrapper}>
          {showBackButton && isInFullscreen && (
            <button
              className={styles.backButton}
              onClick={() => { toggleFullscreen(); navigate(-1); }}
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <iframe
            src={embedUrl}
            className={styles.iframe}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
        {/* Minimal controls: just fullscreen toggle */}
        <div className={styles.controlsWrapper}>
          <div className={styles.controls}>
            <div className={styles.leftControls}>
              {title && <span className={styles.videoTitle}>{title}</span>}
              {useGdriveFallback && (
                <span style={{ fontSize: '0.7rem', opacity: 0.7, padding: '2px 6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px' }}>
                  Google Drive
                </span>
              )}
            </div>
            <div className={styles.rightControls}>
              <button onClick={toggleFullscreen} className={styles.controlButton} aria-label="Fullscreen">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Direct upload / HTML5 video ──
  if (isDirectUpload) {
    const isInFullscreen = isFakeFullscreen || isFullscreen;

    const handleH5TimeUpdate = () => {
      if (html5VideoRef.current) setCurrentTime(html5VideoRef.current.currentTime);
    };
    const handleH5LoadedMetadata = () => {
      if (html5VideoRef.current) {
        setDuration(html5VideoRef.current.duration);
        setIsReady(true);
      }
    };
    const handleH5Play = () => setIsPlaying(true);
    const handleH5Pause = () => setIsPlaying(false);
    const handleH5Ended = () => { setIsPlaying(false); onVideoEnd?.(); };
    const handleH5Error = () => setVideoError(true);

    const toggleH5Play = () => {
      if (!html5VideoRef.current) return;
      if (html5VideoRef.current.paused) html5VideoRef.current.play();
      else html5VideoRef.current.pause();
    };
    const toggleH5Mute = () => {
      if (!html5VideoRef.current) return;
      html5VideoRef.current.muted = !html5VideoRef.current.muted;
      setIsMuted(html5VideoRef.current.muted);
    };
    const seekH5 = (time: number) => {
      if (!html5VideoRef.current) return;
      html5VideoRef.current.currentTime = time;
      setCurrentTime(time);
    };
    const skipH5 = (secs: number) => {
      if (!html5VideoRef.current) return;
      seekH5(Math.max(0, Math.min(html5VideoRef.current.duration || 0, html5VideoRef.current.currentTime + secs)));
    };
    const cycleH5Speed = () => {
      const idx = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
      const next = PLAYBACK_SPEEDS[(idx + 1) % PLAYBACK_SPEEDS.length];
      setPlaybackSpeed(next);
      if (html5VideoRef.current) html5VideoRef.current.playbackRate = next;
    };
    const handleH5ProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      seekH5(pct * duration);
    };
    const toggleH5Fullscreen = async () => {
      if (isFullscreen || isFakeFullscreen) {
        try { if (document.fullscreenElement) await document.exitFullscreen(); } catch {}
        setIsFakeFullscreen(false); setIsFullscreen(false); setCleanView(false);
        try { (screen.orientation as any).unlock(); } catch {}
        return;
      }
      try {
        if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
        else { setIsFakeFullscreen(true); setIsFullscreen(true); }
      } catch { setIsFakeFullscreen(true); setIsFullscreen(true); }
      try { await (screen.orientation as any).lock('landscape'); } catch {}
    };

    if (videoError) {
      return (
        <div className={`${styles.errorContainer} ${className || ""}`}>
          <p>Failed to load video</p>
        </div>
      );
    }

    return (
      <div ref={containerRef} className={`${styles.playerContainer} ${isFakeFullscreen ? styles.fakeFullscreen : ''} ${className || ""}`}>
        <div className={styles.html5PlayerWrapper} onClick={toggleH5Play}>
          {showBackButton && isInFullscreen && (
            <button className={styles.backButton} onClick={(e) => { e.stopPropagation(); toggleH5Fullscreen(); navigate(-1); }} aria-label="Go back">
              <ArrowLeft size={20} />
            </button>
          )}
          {!isReady && <div className={styles.loadingOverlay}><TextLoading texts={["Loading video..."]} /></div>}
          <video
            ref={html5VideoRef}
            src={videoUrl}
            autoPlay={autoPlay}
            playsInline
            onTimeUpdate={handleH5TimeUpdate}
            onLoadedMetadata={handleH5LoadedMetadata}
            onPlay={handleH5Play}
            onPause={handleH5Pause}
            onEnded={handleH5Ended}
            onError={handleH5Error}
          />
        </div>
        <div className={styles.controlsWrapper}>
          <div className={styles.progressBarContainer} onClick={handleH5ProgressClick}>
            <div className={styles.progressBar}>
              <div className={styles.progressFilled} style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
            </div>
          </div>
          <div className={styles.controls}>
            <div className={styles.leftControls}>
              <button onClick={(e) => { e.stopPropagation(); skipH5(-10); }} className={styles.controlButton}><SkipBack size={18} /></button>
              <button onClick={(e) => { e.stopPropagation(); toggleH5Play(); }} className={styles.controlButton}>{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
              <button onClick={(e) => { e.stopPropagation(); skipH5(10); }} className={styles.controlButton}><SkipForward size={18} /></button>
              <span className={styles.timeDisplay}>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            <div className={styles.rightControls}>
              <button onClick={(e) => { e.stopPropagation(); toggleH5Mute(); }} className={styles.controlButton}>{isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
              <button onClick={(e) => { e.stopPropagation(); cycleH5Speed(); }} className={styles.controlButton} style={{ fontSize: '0.75rem', fontWeight: 700 }}>{playbackSpeed}x</button>
              <button onClick={(e) => { e.stopPropagation(); setCleanView(!cleanView); }} className={styles.controlButton}>{cleanView ? <Eye size={18} /> : <EyeOff size={18} />}</button>
              <button onClick={(e) => { e.stopPropagation(); toggleH5Fullscreen(); }} className={styles.controlButton}>{isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No valid video URL
  if (!videoId) {
    return (
      <div className={`${styles.errorContainer} ${className || ""}`}>
        <p>Unsupported video URL</p>
      </div>
    );
  }

  const isInFullscreen = isFakeFullscreen || isFullscreen;

  return (
    <div ref={containerRef} className={`${styles.playerContainer} ${isFakeFullscreen ? styles.fakeFullscreen : ''} ${className || ""}`}>
      <div className={styles.playerWrapper}>
        {showBackButton && isInFullscreen && (
          <button
            className={styles.backButton}
            onClick={() => {
              toggleFullscreen();
              navigate(-1);
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div id={`player-${videoId}`} className={styles.iframe} />
        <div className={styles.pointerBlocker} onClick={togglePlay} />
        {!isReady && !videoError && (
          <div className={styles.loading}>
            <TextLoading
              texts={["Loading video...", "Buffering...", "Preparing playback...", "Almost ready..."]}
              interval={1500}
            />
          </div>
        )}
        {videoError && (
          <div className={styles.loading} style={{ flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', textAlign: 'center', padding: '0 16px' }}>
              Unable to load video.
            </p>
          </div>
        )}
      </div>

      {isInFullscreen && cleanView && (
        <button className={styles.showControlsBtn} onClick={() => setCleanView(false)} aria-label="Show controls">
          <Eye size={18} />
        </button>
      )}

      <div className={`${styles.controlsWrapper} ${isInFullscreen && cleanView ? styles.controlsHidden : ''}`}>
        <div className={styles.progressBar} onClick={handleProgressBarClick}>
          <div className={styles.progressTrack}>
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
            <div className={styles.timePill}>
              <span>{formatTime(currentTime)}</span>
              <span className={styles.timeSeparator}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
            <button onClick={() => skip(-10)} className={styles.controlButton} aria-label="Skip back 10 seconds">
              <SkipBack size={18} />
            </button>
            <button onClick={() => skip(10)} className={styles.controlButton} aria-label="Skip forward 10 seconds">
              <SkipForward size={18} />
            </button>
          </div>
          <div className={styles.rightControls}>
            {title && <span className={styles.videoTitle}>{title}</span>}
            <button onClick={cyclePlaybackSpeed} className={styles.speedButton} aria-label="Playback speed" title={`Speed: ${playbackSpeed}x`}>
              {playbackSpeed}x
            </button>
            {isInFullscreen && (
              <button onClick={() => setCleanView(true)} className={styles.controlButton} aria-label="Clean view" title="Hide controls">
                <EyeOff size={18} />
              </button>
            )}
            <button onClick={toggleFullscreen} className={styles.controlButton} aria-label="Fullscreen">
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}
