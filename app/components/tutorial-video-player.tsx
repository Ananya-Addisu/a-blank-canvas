import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { extractYouTubeId } from "~/utils/youtube";
import styles from "./tutorial-video-player.module.css";

interface TutorialVideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function TutorialVideoPlayer({ 
  videoUrl, 
  title, 
  className,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: TutorialVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const videoId = extractYouTubeId(videoUrl);

  useEffect(() => {
    // Load YouTube IFrame Player API
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    // Initialize player when API is ready
    const initPlayer = () => {
      if (window.YT && videoId) {
        playerRef.current = new window.YT.Player(`tutorial-player-${videoId}`, {
          videoId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            loop: 1,
            playlist: videoId, // Required for loop to work
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            playsinline: 1,
            autoplay: 1, // Auto-play enabled
            mute: 0, // Not muted by default
          },
          events: {
            onReady: () => {
              setIsReady(true);
              if (playerRef.current) {
                setDuration(playerRef.current.getDuration());
                playerRef.current.setVolume(volume);
              }
            },
            onStateChange: (event: any) => {
              const playing = event.data === window.YT.PlayerState.PLAYING;
              setIsPlaying(playing);
              
              if (playing) {
                // Update progress every 100ms while playing
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                }
                progressIntervalRef.current = window.setInterval(() => {
                  if (playerRef.current) {
                    setCurrentTime(playerRef.current.getCurrentTime());
                  }
                }, 100);
              } else {
                // Stop updating when paused
                if (progressIntervalRef.current) {
                  clearInterval(progressIntervalRef.current);
                  progressIntervalRef.current = null;
                }
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
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const play = () => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.playVideo();
  };

  const pause = () => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.pauseVideo();
  };

  const skip = (seconds: number) => {
    if (!playerRef.current || !isReady) return;
    const current = playerRef.current.getCurrentTime();
    const dur = playerRef.current.getDuration();
    const newTime = Math.max(0, Math.min(dur, current + seconds));
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !isReady || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    if (playerRef.current && isReady) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleMute = () => {
    if (!playerRef.current || !isReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!videoId) {
    return (
      <div className={`${styles.errorContainer} ${className || ""}`}>
        <p>Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.videoWrapper}>
        <div id={`tutorial-player-${videoId}`} className={styles.iframe} />
        <div className={styles.pointerBlocker} />
      </div>

      <div className={styles.controlsContainer}>
        <div className={styles.progressBar} onClick={handleProgressClick}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }}>
              <div className={styles.progressThumb} />
            </div>
          </div>
        </div>

        <div className={styles.controlsRow}>
          <div className={styles.leftGroup}>
            <button
              onClick={isPlaying ? pause : play}
              className={styles.playPauseBtn}
              disabled={!isReady}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <div className={styles.volumeControl}>
              <button
                onClick={toggleMute}
                className={styles.volumeBtn}
                disabled={!isReady}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                disabled={!isReady}
              />
            </div>

            <div className={styles.timePill}>
              <span>{formatTime(currentTime)}</span>
              <span className={styles.separator}>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className={styles.centerGroup}>
            <button
              onClick={onPrevious}
              className={styles.navBtn}
              disabled={!hasPrevious}
            >
              <ChevronLeft size={18} />
              <span>Prev</span>
            </button>

            <button
              onClick={() => skip(-10)}
              className={styles.skipBtn}
              disabled={!isReady}
            >
              <SkipBack size={16} />
              <span>10s</span>
            </button>

            <button
              onClick={() => skip(10)}
              className={styles.skipBtn}
              disabled={!isReady}
            >
              <SkipForward size={16} />
              <span>10s</span>
            </button>

            <button
              onClick={onNext}
              className={styles.navBtn}
              disabled={!hasNext}
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.rightGroup}>
            {title && <span className={styles.videoTitle}>{title}</span>}
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
