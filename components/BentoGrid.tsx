'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Destination } from '@/lib/types';
import { Play, Pause, Volume2, ArrowRight, MapPin, Sparkles, Clock, Compass, ShieldCheck } from 'lucide-react';

interface BentoGridProps {
  destinations: Destination[];
}

export default function BentoGrid({ destinations }: BentoGridProps) {
  // Điểm đến lớn tiêu biểu (Tháp Yang PRông hoặc điểm isFeatured đầu tiên)
  const featured = destinations.find((d) => d.slug === 'thap-cham-yang-prong') || destinations[0];
  const secondary = destinations.filter((d) => d.id !== featured?.id);

  // Audio player state cho thẻ tiêu biểu
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(25);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Fallback simulate play if browser blocks autoplay or remote url is restricted
        setIsPlaying(true);
      });
      setIsPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 100;
    setProgress((cur / dur) * 100);
  };

  return (
    <section className="py-8" id="thuyet-minh-so">
      {/* Audio element ẩn */}
      <audio
        ref={audioRef}
        src={featured?.audioVoiceUrl || 'https://actions.google.com/sounds/v1/ambiences/outdoor_ambience.ogg'}
        onTimeUpdate={onTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header của Bento */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Không gian Di sản Nổi bật</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1C1917] tracking-tight">
            Kho tàng Di tích & Thắng cảnh Xứ Sở Ea Súp
          </h2>
        </div>
        <p className="text-sm text-stone-600 max-w-md">
          Khám phá bức tranh giao thoa trầm tích văn hóa Champa cổ kính, tiếng chiêng buôn làng và kỳ quan sinh thái biên cương.
        </p>
      </div>

      {/* ASYMMETRICAL BENTO GRID - ANTI-SLOP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* THẺ CHÍNH LỚN: 7 CỘT (DANH THẮNG TIÊU BIỂU + MINI AUDIO PLAYER) */}
        {featured && (
          <div className="lg:col-span-7 group relative bg-[#FFFFFF] rounded-2xl border border-[#E7E2D7] overflow-hidden shadow-heritage flex flex-col justify-between">
            {/* Ảnh nền danh lam */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden">
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Tag góc */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-[#A64B2A] text-white text-xs font-bold tracking-wide uppercase shadow">
                  Di sản Quốc gia
                </span>
                {featured.historicalPeriod && (
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#1C1917] text-xs font-medium shadow flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#0066CC]" />
                    {featured.historicalPeriod}
                  </span>
                )}
              </div>

              {/* Tên danh lam nổi trên ảnh */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs uppercase tracking-wider text-amber-300 font-semibold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {featured.address}
                </p>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug drop-shadow-sm">
                  {featured.title}
                </h3>
              </div>
            </div>

            {/* Nội dung tóm tắt & Mini Audio Player */}
            <div className="p-6 bg-[#FFFFFF] flex-1 flex flex-col justify-between space-y-5">
              <p className="text-stone-600 text-sm leading-relaxed line-clamp-3 font-normal">
                {featured.content}
              </p>

              {/* MINI AUDIO PLAYER TRỰC TIẾP TRÊN THẺ */}
              <div className="bg-[#FBF9F5] rounded-xl p-4 border border-[#E7E2D7] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0066CC] text-white flex items-center justify-center">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1917] leading-none">
                        Thuyết minh AI Tự Động
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Giọng đọc di sản truyền cảm (Ea Súp Audio Tour)
                      </p>
                    </div>
                  </div>

                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-[#0066CC] hover:bg-[#0052A3] text-white flex items-center justify-center shadow-md transition-transform hover:scale-105"
                    aria-label="Phát thuyết minh"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                </div>

                {/* Thanh tiến độ nghe */}
                <div className="space-y-1">
                  <div className="w-full bg-[#E7E2D7] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0066CC] h-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>{isPlaying ? 'Đang phát lời bình...' : 'Nhấn để nghe thuyết minh'}</span>
                    <span>03:45</span>
                  </div>
                </div>
              </div>

              {/* Nút xem chi tiết */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E7E2D7]/60">
                <div className="text-xs text-stone-500">
                  <span className="font-semibold text-[#1C1917]">{featured.viewsCount.toLocaleString()}</span> lượt quan tâm
                </div>
                <Link
                  href={`/destinations/${featured.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066CC] hover:text-[#A64B2A] transition-colors"
                >
                  <span>Khám phá khảo cứu chi tiết</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* THẺ VỆ TINH BÊN PHẢI: 5 CỘT (CẤU TRÚC 3 KHỐI BẤT ĐỐI XỨNG) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Vệ tinh 1: Thẻ Hồ Ea Súp Thượng */}
          {secondary[0] && (
            <Link
              href={`/destinations/${secondary[0].slug}`}
              className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E7E2D7] overflow-hidden shadow-heritage p-5 flex gap-4 hover:border-[#0066CC]/50 transition-all"
            >
              <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative">
                <img
                  src={secondary[0].thumbnail}
                  alt={secondary[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                  Cảnh quan
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#0066CC] uppercase tracking-wider block mb-1">
                    Hồ Sinh Thái
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#1C1917] group-hover:text-[#0066CC] transition-colors line-clamp-2">
                    {secondary[0].title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span>Hoàng hôn & dạo thuyền</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0066CC] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Vệ tinh 2: Thẻ Không gian Cồng Chiêng Buôn A2 */}
          {secondary[1] && (
            <Link
              href={`/destinations/${secondary[1].slug}`}
              className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E7E2D7] overflow-hidden shadow-heritage p-5 flex gap-4 hover:border-[#0066CC]/50 transition-all"
            >
              <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden relative">
                <img
                  src={secondary[1].thumbnail}
                  alt={secondary[1].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-[#A64B2A] text-white text-[10px] font-bold">
                  Buôn Làng
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#A64B2A] uppercase tracking-wider block mb-1">
                    Di sản Phi vật thể
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#1C1917] group-hover:text-[#A64B2A] transition-colors line-clamp-2">
                    {secondary[1].title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                  <span>Nhà dài Êđê & Men rượu cần</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#A64B2A] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}

          {/* Vệ tinh 3: Thẻ Nông sản OCOP Xoài Cát Ea Súp & Liên kết vùng */}
          <div className="bg-[#0066CC] text-white rounded-2xl p-5 shadow-heritage flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-900 text-[11px] font-bold uppercase tracking-wider">
                  OCOP 4 Sao Đắk Lắk
                </span>
                <span className="text-xs text-amber-200 font-mono">3.000+ Hecta</span>
              </div>
              <h4 className="font-serif text-lg font-bold mb-2">
                Hương Vị Xoài Cát Ea Súp & Mật Ong Rừng
              </h4>
              <p className="text-xs text-stone-200 leading-relaxed mb-4">
                Kết hợp hành trình di sản cùng trải nghiệm miệt vườn biên giới. Tự tay thu hoạch và thưởng thức trái cây chín mọng tại vùng trũng nắng gió.
              </p>
            </div>
            <Link
              href="/destinations/vung-xoai-cat-ea-sup-ocop"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-white text-[#0066CC] text-xs font-bold hover:bg-amber-100 transition-colors shadow"
            >
              <span>Xem nông trang trải nghiệm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
