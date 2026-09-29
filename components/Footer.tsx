import React from 'react';
import Link from 'next/link';
import { Compass, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-[#E7E2D7] pt-16 pb-12 border-t border-[#2D5A43]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Cột 1: Thông tin nền tảng */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2D5A43] flex items-center justify-center text-amber-200">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="font-serif font-bold text-2xl text-white tracking-wide">
                  DANH THẮNG KÝ
                </span>
                <p className="text-xs text-[#A64B2A] font-semibold tracking-wider uppercase">
                  Nền tảng số hóa di tích & văn hóa Ea Súp
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-400 max-w-lg leading-relaxed">
              Dự án chuyển đổi số công tác bảo tồn, phát huy giá trị di sản văn hóa, danh lam thắng cảnh và du lịch sinh thái cộng đồng tại huyện biên giới Ea Súp, tỉnh Đắk Lắk. Kết nối văn hóa ngàn đời cùng công nghệ hiện đại.
            </p>

            <blockquote className="border-l-2 border-[#A64B2A] pl-3 text-xs italic text-stone-400">
              &ldquo;Hãy đánh cồng chiêng cho vang xa đến trời xanh, cho lòng người lắng lại bên bếp lửa nhà dài cổ kính.&rdquo;
              <span className="block mt-1 font-normal text-stone-500">— Sử thi Đăm Săn</span>
            </blockquote>
          </div>

          {/* Cột 2: Tra cứu nhanh */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white">Tra cứu di sản</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="/#danh-thang" className="hover:text-[#A64B2A] transition-colors">
                  Tháp Cổ Yang PRông
                </Link>
              </li>
              <li>
                <Link href="/#danh-thang" className="hover:text-[#A64B2A] transition-colors">
                  Hồ Sinh Thái Ea Súp Thượng
                </Link>
              </li>
              <li>
                <Link href="/#danh-thang" className="hover:text-[#A64B2A] transition-colors">
                  Không gian Cồng chiêng Buôn A2
                </Link>
              </li>
              <li>
                <Link href="/#danh-thang" className="hover:text-[#A64B2A] transition-colors">
                  Du lịch Voi Vườn QG Yok Đôn
                </Link>
              </li>
              <li>
                <Link href="/#danh-thang" className="hover:text-[#A64B2A] transition-colors">
                  Đặc sản Xoài Cát OCOP 4 sao
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Đơn vị chủ quản */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white">Cơ quan phụ trách</h4>
            <div className="space-y-2.5 text-xs text-stone-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2D5A43] shrink-0 mt-0.5" />
                <span>Trung tâm Văn hóa - Thể thao & Truyền thông Huyện Ea Súp, Tỉnh Đắk Lắk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2D5A43] shrink-0" />
                <span>Hotline Du lịch: (0262) 3688.xxx</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2D5A43] shrink-0" />
                <span>danhthangky@easup.daklak.gov.vn</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200/80 hover:text-amber-200 underline underline-offset-4"
                >
                  <span>Cổng quản trị viên</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2025 - 2026 DANH THẮNG KÝ. Bản quyền thuộc UBND Huyện Ea Súp, Tỉnh Đắk Lắk.</p>
          <p className="flex items-center gap-2">
            <span>Thiết kế theo chuẩn Taste Skill di sản</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#2D5A43]"></span>
            <span>Next.js 15 Standalone</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
