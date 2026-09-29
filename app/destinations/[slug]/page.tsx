import React from 'react';
import { notFound } from 'next/navigation';
import { calculateDistanceKm, getDbDestinationBySlug, getDbDestinations } from '@/lib/prisma';
import AudioPlayerBar from '@/components/AudioPlayerBar';
import ReviewSection from '@/components/ReviewSection';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  Compass,
  Calendar,
  AlertCircle,
  Sparkles,
  Ticket,
  ChevronLeft,
  Navigation,
  Share2,
  Bookmark,
  CheckCircle2,
  Utensils,
  ShoppingBag,
} from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDbDestinationBySlug(slug);

  if (!dest) {
    return { title: 'Không tìm thấy di tích | Danh Thắng Ký' };
  }

  return {
    title: `${dest.title} | Danh Thắng Ký Ea Súp`,
    description: dest.subTitle || dest.content.slice(0, 160),
    openGraph: {
      title: `${dest.title} | Danh Thắng Ký`,
      description: dest.content.slice(0, 160),
      images: [{ url: dest.thumbnail }],
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = await getDbDestinationBySlug(slug);

  if (!destination) {
    notFound();
  }

  // Lấy các điểm đến lân cận trong bán kính 10km
  const allDestinations = await getDbDestinations();
  const nearby = allDestinations
    .filter((d) => d.id !== destination.id)
    .map((d) => ({
      ...d,
      distanceKm: calculateDistanceKm(
        destination.latitude,
        destination.longitude,
        d.latitude,
        d.longitude
      ),
    }))
    .filter((d) => (d.distanceKm || 0) <= 25)
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-stone-500">
        <Link
          href="/#danh-thang"
          className="inline-flex items-center gap-1.5 hover:text-[#0066CC] font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Quay lại Bản đồ & Danh sách</span>
        </Link>
        <span className="font-mono">{destination.viewsCount.toLocaleString()} lượt xem khảo cứu</span>
      </div>

      {/* ====================================================================
          PHẦN 1: TIÊU ĐỀ LỚN PHONG CÁCH TẠP CHÍ DI SẢN (HERITAGE MAGAZINE)
          ==================================================================== */}
      <header className="space-y-4 border-b border-[#E7E2D7] pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#0066CC] text-white text-xs font-bold uppercase tracking-wider">
            {destination.category?.name || 'Di tích & Thắng cảnh'}
          </span>
          {destination.historicalPeriod && (
            <span className="px-3 py-1 rounded-full bg-[#A64B2A]/10 text-[#A64B2A] text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Niên đại: {destination.historicalPeriod}</span>
            </span>
          )}
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1917] tracking-tight leading-[1.2]">
          {destination.title}
        </h1>

        {destination.subTitle && (
          <p className="text-base sm:text-lg text-stone-600 font-serif italic max-w-3xl leading-relaxed">
            &ldquo;{destination.subTitle}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#A64B2A] shrink-0" />
            <span className="font-semibold text-[#1C1917]">{destination.address}</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066CC] text-white font-semibold hover:bg-[#0052A3] transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Dẫn đường Google Maps</span>
            </a>
          </div>
        </div>
      </header>

      {/* ====================================================================
          PHẦN 2: TRÌNH PHÁT THUYẾT MINH SỐ ĐA PHƯƠNG TIỆN (AUDIO BAR)
          ==================================================================== */}
      <AudioPlayerBar
        title={destination.title}
        audioUrl={destination.audioVoiceUrl}
        slug={destination.slug}
      />

      {/* ====================================================================
          PHẦN 3: BỐ CỤC NỘI DUNG CHÍNH & CẨM NANG DU KHÁCH
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CỘT TRÁI (8 CỘT): KHẢO CỨU LỊCH SỬ & THƯ VIỆN ẢNH */}
        <div className="lg:col-span-8 space-y-8">
          {/* Ảnh tiêu biểu */}
          <div className="relative rounded-2xl overflow-hidden border border-[#E7E2D7] shadow-heritage">
            <img
              src={destination.thumbnail}
              alt={destination.title}
              className="w-full h-[380px] sm:h-[460px] object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-mono">
              GPS: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
            </div>
          </div>

          {/* Nội dung bài viết khảo cứu */}
          <article className="prose prose-stone max-w-none space-y-6 text-[#1C1917] leading-relaxed text-base">
            <div className="bg-[#F5F2EB] p-4 rounded-xl border-l-4 border-[#0066CC] text-sm text-stone-700 italic">
              Bài viết được số hóa và biên soạn bởi Đoàn Thanh Niên Ea Súp - Đắk Lắk dựa trên tư liệu lịch sử di tích xã Ea Súp kết hợp khảo sát thực địa địa bàn biên giới.
            </div>

            {destination.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-stone-800 leading-relaxed font-normal">
                {paragraph}
              </p>
            ))}
          </article>

          {/* Thư viện ảnh trượt / Lightbox Grid */}
          {destination.gallery && destination.gallery.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E7E2D7]">
              <h3 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0066CC]" />
                <span>Thư Viện Ảnh Khảo Cứu Thực Địa</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {destination.gallery.map((img, i) => (
                  <div
                    key={i}
                    className="group relative rounded-xl overflow-hidden h-36 sm:h-44 border border-[#E7E2D7] bg-stone-100 shadow-sm"
                  >
                    <img
                      src={img}
                      alt={`${destination.title} - ảnh ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phân hệ đánh giá cộng đồng */}
          <ReviewSection
            destinationId={destination.id}
            initialReviews={destination.reviews || []}
          />
        </div>

        {/* CỘT PHẢI (4 CỘT): SỔ TAY TRẢI NGHIỆM & CẨM NANG BẢN ĐỊA */}
        <div className="lg:col-span-4 space-y-6">
          {/* Khối Sổ tay cẩm nang du khách */}
          <div className="bg-white rounded-2xl border border-[#E7E2D7] p-6 shadow-heritage space-y-6">
            <div className="flex items-center gap-2 border-b border-[#E7E2D7] pb-3">
              <Compass className="w-5 h-5 text-[#0066CC]" />
              <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                Sổ Tay Trải Nghiệm
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              {destination.bestSeason && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#A64B2A]" />
                    Mùa tham quan lý tưởng:
                  </span>
                  <p className="text-stone-600 pl-5 leading-relaxed">{destination.bestSeason}</p>
                </div>
              )}

              {destination.visitingHours && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0066CC]" />
                    Khung giờ đón khách:
                  </span>
                  <p className="text-stone-600 pl-5 leading-relaxed">{destination.visitingHours}</p>
                </div>
              )}

              {destination.entryFee && (
                <div className="space-y-1">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-[#0066CC]" />
                    Vé tham quan:
                  </span>
                  <p className="text-stone-600 pl-5 font-semibold text-emerald-800">
                    {destination.entryFee}
                  </p>
                </div>
              )}

              {destination.culturalNotes && (
                <div className="space-y-1 pt-2 border-t border-[#E7E2D7]">
                  <span className="font-bold text-[#A64B2A] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    Lưu ý phong tục & Kiêng kỵ bản địa:
                  </span>
                  <p className="text-stone-700 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60 leading-relaxed">
                    {destination.culturalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Khối Đặc sản OCOP & Ẩm thực kết nối */}
          <div className="bg-[#0066CC] text-white rounded-2xl p-6 shadow-heritage space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <h4 className="font-serif text-base font-bold">Món Ngon & Sản Phẩm OCOP</h4>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed">
              Khi đến tham quan khu vực này, đừng bỏ lỡ những đặc sản nức tiếng địa phương:
            </p>
            <ul className="text-xs space-y-2 text-amber-100">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Xoài Cát Ea Súp (OCOP 4 sao, trái mọng ngọt thơm)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Cá bống kho nghệ lòng hồ & Cơm lam nướng</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Rượu cần men lá rừng truyền thống người Êđê</span>
              </li>
            </ul>
          </div>

          {/* Khối Điểm đến lân cận trong bán kính */}
          {nearby.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E7E2D7] p-6 shadow-heritage space-y-4">
              <h4 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#A64B2A]" />
                <span>Điểm Lân Cận ({`<`} 25km)</span>
              </h4>
              <div className="space-y-3">
                {nearby.map((item) => (
                  <Link
                    key={item.id}
                    href={`/destinations/${item.slug}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[#F5F2EB] transition-colors"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#1C1917] group-hover:text-[#0066CC] truncate">
                        {item.title}
                      </h5>
                      <span className="text-[11px] text-[#A64B2A] font-mono">
                        Cách khoảng {item.distanceKm?.toFixed(1)} km
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
