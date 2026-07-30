'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BoomerangVideoBgProps {
  src: string;
}

export function BoomerangVideoBg({ src }: BoomerangVideoBgProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [framesReady, setFramesReady] = useState(false);
  const framesRef = useRef<ImageBitmap[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let isCapturing = true;
    let captureCallbackId: number;
    let lastTime = -1;
    let rafId: number;

    // Ensure loop is FALSE initially so the 'ended' event fires after the first forward pass
    video.loop = false;
    // Set video playback rate to 0.65x for cinematic slow motion
    video.playbackRate = 0.65;

    // Force video play
    video.play().catch(() => {});

    const captureFrame = async () => {
      if (!isCapturing || !video) return;

      if (video.currentTime !== lastTime && video.videoWidth > 0) {
        lastTime = video.currentTime;

        const maxW = 960;
        const scale = Math.min(1, maxW / video.videoWidth);
        const w = Math.floor(video.videoWidth * scale);
        const h = Math.floor(video.videoHeight * scale);

        if (canvas.width !== w) {
          canvas.width = w;
          canvas.height = h;
        }

        try {
          const bitmap = await window.createImageBitmap(video, {
            resizeWidth: w,
            resizeHeight: h,
            resizeQuality: 'low',
          });
          framesRef.current.push(bitmap);
        } catch {
          // If createImageBitmap fails, fallback runs smoothly
        }
      }

      if (isCapturing) {
        if ('requestVideoFrameCallback' in video) {
          captureCallbackId = (video as any).requestVideoFrameCallback(captureFrame);
        } else {
          captureCallbackId = requestAnimationFrame(captureFrame);
        }
      }
    };

    const startPingPongCanvas = () => {
      const frames = framesRef.current;
      if (frames.length === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let frameIdx = 0;
      let forward = true;
      let lastFrameTimestamp = 0;
      // 22 FPS for smooth, slower boomerang playback
      const frameInterval = 1000 / 22;

      const animateBoomerang = (timestamp: number) => {
        if (timestamp - lastFrameTimestamp >= frameInterval) {
          lastFrameTimestamp = timestamp;

          const frame = frames[frameIdx];
          if (frame) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frame, 0, 0);
          }

          if (forward) {
            frameIdx++;
            if (frameIdx >= frames.length - 1) {
              frameIdx = frames.length - 1;
              forward = false;
            }
          } else {
            frameIdx--;
            if (frameIdx <= 0) {
              frameIdx = 0;
              forward = true;
            }
          }
        }
        rafId = requestAnimationFrame(animateBoomerang);
      };

      rafId = requestAnimationFrame(animateBoomerang);
    };

    // Video Fallback ping-pong using currentTime if canvas frames couldn't be bitmap captured
    const startPingPongVideoFallback = () => {
      let forward = false;
      let lastTimestamp = 0;

      const animateVideoReverse = (timestamp: number) => {
        if (!video) return;
        // Slow down time stepping by 0.6x for smooth video fallback
        const delta = ((timestamp - (lastTimestamp || timestamp)) / 1000) * 0.6;
        lastTimestamp = timestamp;

        if (forward) {
          if (video.currentTime >= video.duration - 0.1) {
            forward = false;
          } else {
            video.currentTime = Math.min(video.duration, video.currentTime + delta);
          }
        } else {
          if (video.currentTime <= 0.1) {
            forward = true;
          } else {
            video.currentTime = Math.max(0, video.currentTime - delta);
          }
        }
        rafId = requestAnimationFrame(animateVideoReverse);
      };

      rafId = requestAnimationFrame(animateVideoReverse);
    };

    const handlePlay = () => {
      if ('requestVideoFrameCallback' in video) {
        captureCallbackId = (video as any).requestVideoFrameCallback(captureFrame);
      } else {
        captureCallbackId = requestAnimationFrame(captureFrame);
      }
    };

    const handleEnded = () => {
      isCapturing = false;
      if ('cancelVideoFrameCallback' in video) {
        (video as any).cancelVideoFrameCallback(captureCallbackId);
      } else {
        cancelAnimationFrame(captureCallbackId);
      }

      if (framesRef.current.length > 5) {
        setFramesReady(true);
        startPingPongCanvas();
      } else {
        startPingPongVideoFallback();
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('ended', handleEnded);

    return () => {
      isCapturing = false;
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('ended', handleEnded);
      if (rafId) cancelAnimationFrame(rafId);
      framesRef.current.forEach(f => {
        if (f.close) f.close();
      });
    };
  }, [src]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.15] origin-top overflow-hidden bg-[#f8faf7]">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        autoPlay
        crossOrigin="anonymous"
        className={`w-full h-full object-cover object-top transition-opacity duration-700 ${framesReady ? 'opacity-0 hidden' : 'opacity-100 block'}`}
      />
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover object-top transition-opacity duration-700 ${framesReady ? 'opacity-100 block' : 'opacity-0 hidden'}`}
      />
    </div>
  );
}
