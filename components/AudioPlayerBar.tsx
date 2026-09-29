'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, Volume2, VolumeX, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';

interface AudioPlayerBarProps {
  title: string;
  audioUrl?: string | null;
  slug: string;
}

export default function AudioPlayerBar({ title, audioUrl, slug }: AudioPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3:00 default fallback
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [qrSimulationActive, setQrSimulationActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = audioUrl || 'https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg';

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setIsPlaying(true);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  // Mô phỏng quét mã QR tại thực địa Ea Súp
  const simulateQrScan = () => {
    setQrSimulationActive(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      setTimeout(() => setQrSimulationActive(false), 3000);
    }, 800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E2D7] p-5 shadow-heritage space-y-4">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        muted={isMuted}
      />

      {/* Header Player */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center shadow-sm">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider">
                Thuyết Minh Số Tự Động
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                AI Voice Di Sản
              </span>
            </div>
            <h4 className="text-sm font-bold text-[#1C1917] truncate max-w-sm">
              Lời bình: {title}
            </h4>
          </div>
        </div>

        {/* Nút mô phỏng quét QR tại thực địa */}
        <button
          onClick={simulateQrScan}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F5F2EB] hover:bg-stone-200 text-[#1C1917] text-xs font-semibold border border-[#E7E2D7] transition-all self-start sm:self-auto"
          title="Mô phỏng trải nghiệm quét mã QR gắn tại bia di tích để máy tự động phát thuyết minh"
        >
          <QrCode className="w-4 h-4 text-[#A64B2A]" />
          <span>Quét QR tại bia di tích</span>
        </button>
      </div>

      {qrSimulationActive && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Đã nhận diện tọa độ di tích qua mã QR thực địa! Hệ thống đang phát bài thuyết minh tự động...</span>
        </div>
      )}

      {/* Thanh Scrubber & Thời gian */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#2D5A43]"
        />
        <div className="flex justify-between text-xs text-stone-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Bộ điều khiển Play/Pause/Speed/Mute */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={restartAudio}
            className="p-2 rounded-lg text-stone-600 hover:text-[#1C1917] hover:bg-stone-100 transition-colors"
            title="Nghe lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-[#2D5A43] hover:bg-[#234634] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105"
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát thuyết minh'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold font-mono transition-colors"
            title="Đổi tốc độ đọc"
          >
            {playbackRate}x
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-lg text-stone-600 hover:text-[#1C1917] hover:bg-stone-100 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
