import React from 'react';
import { getDbCategories, getDbDestinations, getDbItineraries } from '@/lib/prisma';
import BentoGrid from '@/components/BentoGrid';
import InteractiveMap from '@/components/InteractiveMap';
import Link from 'next/link';
import {
  Compass,
  Search,
  MapPin,
  Clock,
  Sparkles,
  Calendar,
  ChevronRight,
  Headphones,
  CheckCircle2,
  Trees,
  Landmark,
  Waves,
  Flame,
} from 'lucide-react';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  const [destinations, categories, itineraries] = await Promise.all([
    getDbDestinations(),
    getDbCategories(),
    getDbItineraries(),
  ]);

  return (
    <div className="space-y-16 pb-20">
      {/* ====================================================================
          PHẦN 1: HERO SECTION - CHUẨN TASTE SKILL (HERO DISCIPLINE)
          - Tiêu đề tối đa 2 dòng, font Serif trang trọng
          - Dẫn nhập súc tích dưới 20 từ
          - Thanh tra cứu nhanh và định vị bản đồ trong tầm mắt đầu tiên
          ==================================================================== */}
      <section className="relative pt-6 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-[#E7E2D7] shadow-heritage p-8 sm:p-12 lg:p-14 min-h-[480px] flex items-center">
          {/* Ảnh nền Hồ Ea Súp Thượng (Đập Thủy Lợi) được hòa trộn mỹ thuật */}
          <div className="absolute inset-0 z-0">
            <img
              src="/hero-easup.jpg"
              alt="Hồ Ea Súp Thượng - Đập Thủy Lợi Ea Súp"
              className="w-full h-full object-cover object-[75%_center] filter brightness-[0.98] contrast-[1.04]"
            />
            {/* Lớp hòa sắc di sản mềm mại (Harmonious Gradient Scrim) bảo vệ độ tương phản chữ */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FBF9F5] via-[#FBF9F5]/90 to-[#FBF9F5]/30 sm:via-[#FBF9F5]/85 sm:to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F5]/90 via-transparent to-transparent sm:hidden" />
          </div>

          {/* Badge góc phải: Chú thích danh thắng Hồ Ea Súp Thượng */}
          <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-2 bg-[#1C1917]/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white text-[11px] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">Toàn cảnh Hồ Thủy Lợi Ea Súp Thượng</span>
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            {/* Tag hành chính & logo Đoàn thanh niên */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0066CC] text-white text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm">
              <img
                src="/logo-doan-thanh-nien.png"
                alt="Huy hiệu Đoàn Thanh Niên Cộng Sản Hồ Chí Minh"
                className="w-5 h-5 object-contain shrink-0 drop-shadow-sm"
              />
              <span>ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK</span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] tracking-tight leading-[1.15] drop-shadow-sm">
              DU LỊCH EA SÚP
              <span className="block text-[#A64B2A] text-2xl sm:text-3xl lg:text-4xl mt-2 font-bold tracking-normal">
                BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
              </span>
            </h1>

            {/* Dẫn nhập súc tích (Dưới 20 từ) */}
            <p className="text-base sm:text-lg text-stone-800 leading-relaxed font-normal max-w-2xl">
              Khám phá ngọn tháp Chàm Yang PRông cổ kính, biển hồ Ea Súp Thượng mênh mông và hồn cồng chiêng buôn làng.
            </p>

            {/* THANH TRA CỨU NHANH & BỘ LỌC NGAY TẦM MẮT */}
            <div className="pt-2">
              <form
                action="#danh-thang"
                method="GET"
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-[#E7E2D7] shadow-heritage"
              >
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Search className="w-5 h-5 text-[#0066CC]" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Tìm kiếm: Tháp Yang PRông, Hồ Ea Súp, Buôn A2, Yok Đôn..."
                    className="w-full bg-transparent text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="#ban-do-du-lich"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F5F2EB]/90 hover:bg-stone-200 text-[#1C1917] text-xs font-semibold transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-[#A64B2A]" />
                    <span>Mở Bản Đồ GIS</span>
                  </a>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-md hover:scale-[1.02]"
                  >
                    <span>Tra Cứu</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Danh mục nhanh */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-stone-700 mr-1 drop-shadow-sm">Chủ đề:</span>
              <a
                href="#danh-thang"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E7E2D7] text-[#0066CC] hover:border-[#0066CC] shadow-sm transition-colors"
              >
                🏛️ Di tích Lịch sử
              </a>
              <a
                href="#danh-thang"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E7E2D7] text-[#0066CC] hover:border-[#0066CC] shadow-sm transition-colors"
              >
                🌊 Hồ sinh thái Ea Súp Thượng
              </a>
              <a
                href="#danh-thang"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E7E2D7] text-[#0066CC] hover:border-[#0066CC] shadow-sm transition-colors"
              >
                🔥 Cồng chiêng Buôn A2
              </a>
              <a
                href="#danh-thang"
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md border border-[#E7E2D7] text-[#0066CC] hover:border-[#0066CC] shadow-sm transition-colors"
              >
                🐘 Voi thân thiện Yok Đôn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          PHẦN 2: BENTO GRID BẤT ĐỐI XỨNG - ANTI-SLOP (MINI AUDIO THUYẾT MINH)
          ==================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BentoGrid destinations={destinations} />
      </div>

      {/* ====================================================================
          PHẦN 3: BẢN ĐỒ DU LỊCH TƯƠNG TÁC GIS LEAFLET.JS
          ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24" id="ban-do-du-lich">
        <div className="bg-white rounded-3xl border border-[#E7E2D7] p-6 sm:p-8 shadow-heritage space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A64B2A] uppercase tracking-wider mb-2">
                <MapPin className="w-4 h-4" />
                <span>Hệ thống Định vị Địa không gian GIS</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Bản Đồ Không Gian Du Lịch Xã Ea Súp, Tỉnh Đắk Lắk
              </h2>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Tọa độ trung tâm xã: 13.070029, 107.883355
              </p>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 max-w-md">
              Chấm tọa độ chính xác từng di tích, hồ chứa nước và buôn làng. Nhấn vào biểu tượng huy hiệu xã để định vị trung tâm hành chính và kích hoạt chỉ đường Google Maps.
            </p>
          </div>

          {/* Map Leaflet */}
          <InteractiveMap
            destinations={destinations}
            initialCenter={[13.070029, 107.883355]}
            initialZoom={12}
            height="520px"
          />
        </div>
      </section>

      {/* ====================================================================
          PHẦN 4: TOÀN BỘ DANH THẮNG & BỘ LỌC CHUYÊN ĐỀ
          ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24" id="danh-thang">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider block mb-1">
                Khám phá chuyên sâu
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Hệ Thống Di Sản & Điểm Đến Du Lịch
              </h2>
            </div>
            <span className="text-xs text-stone-500">
              Hiển thị {destinations.length} danh thắng đã được kiểm chứng & biên tập
            </span>
          </div>

          {/* Lưới danh mục 2 cột lớn - Anti-Slop (thay vì 3 card bằng nhau) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {destinations.map((dest, idx) => (
              <div
                key={dest.id}
                className="group bg-white rounded-2xl border border-[#E7E2D7] overflow-hidden shadow-heritage hover:border-[#0066CC] transition-all flex flex-col"
              >
                <div className="relative h-64 sm:h-72 w-full overflow-hidden">
                  <img
                    src={dest.thumbnail}
                    alt={dest.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#0066CC] text-white text-xs font-bold shadow">
                      {dest.category?.name || 'Di sản'}
                    </span>
                    {dest.isFeatured && (
                      <span className="px-3 py-1 rounded-full bg-[#A64B2A] text-white text-xs font-bold shadow">
                        ★ Tiêu biểu
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="text-xs text-amber-200 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{dest.address}</span>
                    </p>
                    <h3 className="font-serif text-lg sm:text-xl font-bold leading-snug">
                      {dest.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-stone-600 text-sm leading-relaxed line-clamp-3">
                    {dest.content}
                  </p>

                  <div className="space-y-3 pt-3 border-t border-[#E7E2D7]">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className="flex items-center gap-1 text-[#0066CC] font-medium">
                        <Headphones className="w-3.5 h-3.5" />
                        Có thuyết minh AI
                      </span>
                      {dest.bestSeason && (
                        <span className="truncate max-w-[200px]" title={dest.bestSeason}>
                          Mùa đẹp: {dest.bestSeason.split('(')[0]}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${dest.latitude},${dest.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-stone-500 hover:text-[#A64B2A] underline underline-offset-4"
                      >
                        Chỉ đường GPS ({dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)})
                      </a>

                      <Link
                        href={`/destinations/${dest.slug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-semibold transition-all shadow-sm group-hover:translate-x-0.5"
                      >
                        <span>Chi tiết khảo cứu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          PHẦN 5: GỢI Ý LỊCH TRÌNH DU LỊCH ĐỊA PHƯƠNG
          ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24" id="lich-trinh">
        <div className="bg-[#F5F2EB] rounded-3xl border border-[#E7E2D7] p-5 sm:p-8 lg:p-12 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A64B2A]/10 text-[#A64B2A] text-xs font-bold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Cẩm Nang Lộ Trình</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
              Lịch Trình Khám Phá Ea Súp Tối Ưu
            </h2>
            <p className="text-sm text-stone-600 mt-2 max-w-xl">
              Được nghiên cứu bởi ban cán bộ văn hóa và hướng dẫn viên bản địa, giúp du khách trải nghiệm trọn vẹn di tích và hương vị ẩm thực trong từng khung giờ vàng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {itineraries.map((itinerary) => (
              <div
                key={itinerary.id}
                className="bg-white rounded-2xl border border-[#E7E2D7] p-5 sm:p-6 shadow-sm space-y-6"
              >
                <div className="border-b border-[#E7E2D7] pb-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#0066CC] text-white text-xs font-bold shadow-sm">
                      {itinerary.durationDays}
                    </span>
                    <span className="text-xs text-stone-600 font-medium bg-stone-100 px-3 py-1 rounded-lg">
                      {itinerary.targetAudience}
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1C1917] leading-snug">
                    {itinerary.title}
                  </h3>
                </div>

                {/* Timeline stops */}
                <div className="space-y-4">
                  {itinerary.routeDetails.map((stop, sIdx) => (
                    <div key={sIdx} className="flex gap-4 items-start group">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rounded-full bg-[#0066CC]/15 text-[#0066CC] flex items-center justify-center text-xs font-bold shrink-0">
                          {sIdx + 1}
                        </div>
                        {sIdx !== itinerary.routeDetails.length - 1 && (
                          <div className="w-0.5 h-12 bg-[#E7E2D7] mt-1" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#1C1917]">{stop.title}</h4>
                          <span className="text-[11px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded shrink-0">
                            {stop.time}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {stop.description}
                        </p>
                        {stop.culinaryTip && (
                          <p className="text-xs text-[#A64B2A] font-medium pt-0.5">
                            🍴 Ẩm thực: {stop.culinaryTip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
