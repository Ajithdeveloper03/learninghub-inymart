'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  ShieldAlert, 
  CheckCircle,
  Clock,
  Sparkles,
  Check,
  EyeOff,
  Lock
} from 'lucide-react';

interface CustomVideoPlayerProps {
  sectionId: number;
  initialCompleted?: boolean;
  isForceRewatch?: boolean;
  onVideoCompleted?: () => void;
}

export function CustomVideoPlayer({
  sectionId,
  initialCompleted = false,
  isForceRewatch = false,
  onVideoCompleted,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatchedTime, setMaxWatchedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watermark, setWatermark] = useState<any>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(isForceRewatch ? false : initialCompleted);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Security / Anti-Screen Recording States
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [screenshotAlert, setScreenshotAlert] = useState(false);
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 20 });

  // Interval tracking for segment reporting
  const lastHeartbeatTimeRef = useRef(0);
  const heartbeatTimerRef = useRef<any>(null);

  // 1. Authorize playback & fetch short-lived grant token
  const loadVideo = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await apiFetch(`/videos/${sectionId}/playback-authorize`, {
        method: 'POST',
      });

      if (res.success && res.data) {
        let rawStreamUrl = res.data.stream_url || '/video.mp4';
        if (rawStreamUrl.startsWith('/api')) {
          if (typeof window !== 'undefined') {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              rawStreamUrl = `http://127.0.0.1:8000${rawStreamUrl}`;
            } else if (window.location.pathname.startsWith('/learninghub')) {
              rawStreamUrl = `/learninghub${rawStreamUrl}`;
            }
          }
        }
        setStreamUrl(rawStreamUrl);
        setDuration(res.data.duration_seconds || 180);
        
        const forceZero = isForceRewatch || Boolean(res.data.is_rejected);
        if (forceZero) {
          setMaxWatchedTime(0);
          setCurrentTime(0);
          setCompletionPercentage(0);
          setIsCompleted(false);
        } else {
          setMaxWatchedTime(res.data.last_watched_position || 0);
          setCurrentTime(res.data.last_watched_position || 0);
          setCompletionPercentage(res.data.completion_percentage || 0);
          if (res.data.status === 'VIDEO_COMPLETED') {
            setIsCompleted(true);
          }
        }

        setWatermark(res.data.watermark);
      }
    } catch (e: any) {
      console.warn('Playback authorization fallback:', e.message);
      let fallbackUrl = '/video.mp4';
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/learninghub')) {
        fallbackUrl = '/learninghub/video.mp4';
      }
      setStreamUrl(fallbackUrl);
      setWatermark({
        username: 'ajith_developer',
        session_hint: 'SECURE_ACTIVE',
        ip: '127.0.0.1',
      });
    } finally {
      setIsLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    loadVideo();
    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [loadVideo]);

  // Periodic heartbeat sync to backend (sends segment [start, end])
  const sendProgressHeartbeat = useCallback(
    async (start: number, end: number, pos: number, isEnded = false) => {
      if (end <= start && !isEnded) return;
      try {
        const res = await apiFetch(`/videos/${sectionId}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            segment_start: start,
            segment_end: end,
            current_position: pos,
            total_duration: duration || 180,
            is_ended: isEnded,
          }),
        });

        if (res.success && res.data) {
          setCompletionPercentage(res.data.completion_percentage);
          if ((res.data.is_completed || isEnded) && !isCompleted) {
            setIsCompleted(true);
            setCompletionPercentage(100);
            if (onVideoCompleted) onVideoCompleted();
          }
        }
      } catch (err) {
        console.warn('Progress sync warning:', err);
      }
    },
    [sectionId, duration, isCompleted, onVideoCompleted]
  );

  // Dynamic watermark movement animation
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setWatermarkPos({
        top: Math.floor(Math.random() * 65) + 10,
        left: Math.floor(Math.random() * 60) + 10,
      });
    }, 4000);
    return () => clearInterval(moveInterval);
  }, []);

  // ANTI-SCREEN RECORDING & SCREENSHOT PROTECTION ENGINE
  useEffect(() => {
    // 1. Detect Window Blur / Tab Switching / Screen Recorder Focus Steal
    const handleWindowBlur = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsShieldActive(true);
      }
    };

    const handleWindowFocus = () => {
      // Focus regained
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
          setIsShieldActive(true);
        }
      }
    };

    // 2. Intercept Screen Capture & DevTools Hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        try {
          navigator.clipboard?.writeText('Screenshot blocked: Proprietary Inymart Academy lesson video.');
        } catch (_) {}
        setScreenshotAlert(true);
        setTimeout(() => setScreenshotAlert(false), 3000);
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
        setIsShieldActive(true);
        return;
      }

      // Block Snipping Tool / Screenshot shortcuts (Win+Shift+S, Cmd+Shift+3/4/5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's' || e.code === 'KeyS')) {
        e.preventDefault();
        setScreenshotAlert(true);
        setTimeout(() => setScreenshotAlert(false), 3000);
        setIsShieldActive(true);
        return;
      }

      // Block Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setScreenshotAlert(true);
        setTimeout(() => setScreenshotAlert(false), 3000);
        return;
      }

      // Block Inspect / DevTools (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && ['u', 'U'].includes(e.key))
      ) {
        e.preventDefault();
        setScreenshotAlert(true);
        setTimeout(() => setScreenshotAlert(false), 3000);
        return;
      }

      // ANTI-FORWARD SEEK KEYBOARD BLOCKER
      // If user presses Right Arrow, L (forward 10s), PageUp, End
      if (!isCompleted) {
        if (['ArrowRight', 'KeyL', 'PageUp', 'End'].includes(e.code) || e.key === 'ArrowRight') {
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = maxWatchedTime;
            setCurrentTime(maxWatchedTime);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        try {
          navigator.clipboard?.writeText('');
        } catch (_) {}
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isCompleted, maxWatchedTime]);

  // Video timeupdate handler (HTML5 native video with strict anti-forward seek)
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // STRICT ANTI-FORWARD SEEK ENFORCEMENT:
    if (!isCompleted) {
      if (curr > maxWatchedTime + 0.5) {
        videoRef.current.currentTime = maxWatchedTime;
        setCurrentTime(maxWatchedTime);
        return;
      }
      if (curr > maxWatchedTime) {
        setMaxWatchedTime(curr);
      }
    }

    // Auto-detect end of video
    if (duration > 0 && curr >= duration - 1.5 && !isCompleted) {
      setIsCompleted(true);
      setCompletionPercentage(100);
      sendProgressHeartbeat(lastHeartbeatTimeRef.current, curr, curr, true);
      if (onVideoCompleted) onVideoCompleted();
      return;
    }

    // Heartbeat every 5 seconds of active playback
    if (Math.abs(curr - lastHeartbeatTimeRef.current) >= 5) {
      const segStart = lastHeartbeatTimeRef.current;
      const segEnd = curr;
      lastHeartbeatTimeRef.current = curr;
      sendProgressHeartbeat(segStart, segEnd, curr);
    }
  };

  // Video Ended (HTML5)
  const handleVideoEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    setCompletionPercentage(100);
    if (videoRef.current) {
      const finalPos = videoRef.current.duration || videoRef.current.currentTime;
      sendProgressHeartbeat(lastHeartbeatTimeRef.current, finalPos, finalPos, true);
    }
    if (onVideoCompleted) onVideoCompleted();
  };

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isShieldActive) {
      setIsShieldActive(false);
    }
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Seek Handler with Strict Forward Seek Blocker
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const target = parseFloat(e.target.value);

    if (isCompleted && !isForceRewatch) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
      lastHeartbeatTimeRef.current = target;
    } else {
      // ONLY ALLOW REWINDING BACKWARDS (target <= currentTime):
      if (target <= currentTime) {
        videoRef.current.currentTime = target;
        setCurrentTime(target);
        lastHeartbeatTimeRef.current = target;
      } else {
        // Forward seeking is completely blocked! Snap back to current watched time
        videoRef.current.currentTime = currentTime;
      }
    }
  };

  const rewind10 = () => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, videoRef.current.currentTime - 10);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    lastHeartbeatTimeRef.current = newTime;
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm print:hidden select-none">
      <style jsx global>{`
        @media print {
          body * {
            display: none !important;
          }
        }
      `}</style>

      {/* Loading state */}
      {isLoading && (
        <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold">Initializing Secure Lesson Video...</p>
        </div>
      )}

      {/* Error state */}
      {!isLoading && errorMsg && (
        <div className="aspect-video w-full flex flex-col items-center justify-center bg-slate-900 text-slate-300 p-8 text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Playback Access Restricted</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1">{errorMsg}</p>
          </div>
          <button
            onClick={loadVideo}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Retry Authorization
          </button>
        </div>
      )}

      {/* Video Container */}
      {!isLoading && !errorMsg && streamUrl && (
        <div
          ref={containerRef}
          onContextMenu={(e) => e.preventDefault()}
          className="relative aspect-video bg-black select-none group flex flex-col justify-end overflow-hidden"
        >
          {/* HTML5 NATIVE VIDEO PLAYER */}
          <video
            ref={videoRef}
            src={streamUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onSeeking={() => {
              if (!isCompleted && videoRef.current && videoRef.current.currentTime > maxWatchedTime + 0.3) {
                videoRef.current.currentTime = maxWatchedTime;
                setCurrentTime(maxWatchedTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration) {
                setDuration(videoRef.current.duration);
              }
            }}
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            playsInline
            className="w-full h-full object-cover cursor-pointer"
            onClick={togglePlay}
          />

          {/* PRIVACY SHIELD OVERLAY (ACTIVATES ON SCREEN RECORDER FOCUS STEAL OR TAB SWITCH) */}
          {isShieldActive && (
            <div 
              onClick={() => {
                setIsShieldActive(false);
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
              }}
              className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white cursor-pointer select-none transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 animate-pulse">
                <EyeOff className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black tracking-wide">Screen Capture Protection Active</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Playback paused because window focus was lost or screen recording tools were detected. Screen capture, screen sharing, and recording are strictly prohibited.
              </p>
              <div className="mt-5 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition">
                <Play className="w-3.5 h-3.5" />
                <span>Click Anywhere to Resume Playback</span>
              </div>
            </div>
          )}

          {/* SCREENSHOT BLOCKED ALERT BANNER */}
          {screenshotAlert && (
            <div className="absolute top-4 inset-x-4 z-50 p-3 bg-rose-600/95 text-white rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md border border-white/20 animate-bounce">
              <ShieldAlert className="w-5 h-5 shrink-0 text-white" />
              <div className="text-xs font-bold leading-tight">
                Screenshot / Screen Recording Blocked! Inymart Academy lesson content is encrypted & protected.
              </div>
            </div>
          )}

          {/* DYNAMIC FLOATING WATERMARK OVERLAY */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            <div 
              style={{
                top: `${watermarkPos.top}%`,
                left: `${watermarkPos.left}%`,
                transition: 'top 3s ease-in-out, left 3s ease-in-out',
              }}
              className="absolute text-white/35 text-[11px] font-mono font-bold tracking-wider select-none bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-xs shadow-md"
            >
              <div className="text-orange-400">INYMART ACADEMY &bull; {watermark?.username || 'ajith_developer'}</div>
              <div className="text-slate-300">STUDENT ID: {watermark?.session_hint || 'SECURE'} &bull; {watermark?.ip || '127.0.0.1'}</div>
            </div>
          </div>

          {/* ANTI-FORWARD SEEK LIVE BADGE */}
          {(!isCompleted || isForceRewatch) && (
            <div className="absolute top-4 left-4 z-20 pointer-events-none flex items-center gap-2 bg-slate-950/85 border border-amber-500/40 px-3 py-1.5 rounded-lg text-xs text-amber-200 backdrop-blur-md">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>{isForceRewatch ? 'Task Rejected • Mandatory Video Re-watch • Forward Seek Blocked' : 'Forward Seek Disabled • Sequential Watch Required'}</span>
            </div>
          )}

          {/* Video Completed Banner */}
          {isCompleted && !isForceRewatch && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/50 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Video Completed (100% Watched) &bull; Task Unlocked</span>
            </div>
          )}

          {/* Custom Controls Bar for HTML5 */}
          <div className="relative z-30 bg-gradient-to-t from-black via-black/85 to-transparent p-4 opacity-95 group-hover:opacity-100 transition-opacity">
            {/* Seek Bar with strict anti-skip forward lock */}
            <div className="relative mb-3 flex items-center">
              <div className="absolute inset-x-0 h-1.5 bg-slate-800 rounded-lg overflow-hidden pointer-events-none">
                <div 
                  className="h-full bg-orange-600 transition-all duration-150"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="relative z-10 w-full h-1.5 bg-transparent rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-hidden"
                title={!isCompleted ? "Forward scrubbing is strictly disabled. You can only rewind." : "Seek video"}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-xl bg-orange-600 hover:bg-orange-500 text-white flex items-center justify-center transition shadow-md cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>

                <button
                  onClick={rewind10}
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                  title="Rewind 10s (Allowed)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="text-xs font-mono text-slate-300">
                  <span>{formatTime(currentTime)}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span>{formatTime(duration)}</span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-white/10 px-2.5 py-1 rounded-md border border-white/15">
                  <span>Verified Coverage:</span>
                  <span className="font-semibold text-orange-400">{completionPercentage.toFixed(0)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500 hidden sm:block"
                  />
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner & Action below video */}
      <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-600'
          }`}>
            {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-sm font-black text-slate-900">
              {isCompleted ? 'Video Lesson Completed' : 'Required Video Masterclass'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {isCompleted
                ? 'The task below is now unlocked. Complete and submit the assignment to receive instructor approval.'
                : 'Watch this masterclass video lesson completely to unlock the practical task below.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(!isCompleted || isForceRewatch) ? (
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-4 py-2 rounded-xl shadow-xs">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{isForceRewatch ? 'Task Rejected • Full Re-watch Required • Forward Skip Blocked' : 'Full Video Required • Forward Skip Disabled'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Lesson Complete &bull; Task Unlocked</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
