import React from 'react';
import Link from 'next/link';
import { Compass, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1C1917] text-[#E7E2D7] pt-16 pb-12 border-t border-[#0066CC]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Cột 1: Thông tin nền tảng */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-300/40 shrink-0 bg-white">
                <img
                  src="/logo-easup-official.png"
                  alt="Logo Xã Ea Súp"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif font-bold text-2xl text-white tracking-wide block leading-none">
                  DU LỊCH EA SÚP
                </span>
                <p className="text-[11px] text-[#A64B2A] font-bold tracking-wider uppercase mt-1">
                  BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
                </p>
              </div>
            </div>

            <p className="text-sm text-stone-400 max-w-lg leading-relaxed">
              Dự án số hóa và phát huy giá trị di sản văn hóa, danh lam thắng cảnh và du lịch sinh thái nông nghiệp tại xã Ea Súp, tỉnh Đắk Lắk. Kết nối văn hóa ngàn đời cùng sức trẻ đại ngàn.
            </p>

            <blockquote className="border-l-2 border-[#A64B2A] pl-3 text-xs italic text-stone-400">
              &ldquo;Hãy đánh cồng chiêng cho vang xa đến trời xanh, cho lòng người lắng lại bên bếp lửa nhà dài cổ kính.&rdquo;
              <span className="block mt-1 font-normal text-stone-500">— Sử thi Đăm Săn</span>
            </blockquote>
          </div>

          {/* Cột 2: Điểm nhấn trải nghiệm */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white">Điểm nhấn trải nghiệm</h4>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li>
                <Link
                  href="/destinations/thap-cham-yang-prong"
                  className="flex items-center gap-2 hover:text-amber-200 transition-colors"
                >
                  <span>🏛️</span>
                  <span>Di tích quốc gia Tháp Yang Prông</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/ho-ea-sup-thuong"
                  className="flex items-center gap-2 hover:text-amber-200 transition-colors"
                >
                  <span>🌊</span>
                  <span>Sinh thái Hồ Ea Súp Thượng</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/vuon-quoc-gia-yok-don"
                  className="flex items-center gap-2 hover:text-amber-200 transition-colors"
                >
                  <span>🌿</span>
                  <span>Rừng khộp Yok Đôn nguyên sinh</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/buon-a2-ea-sup"
                  className="flex items-center gap-2 hover:text-amber-200 transition-colors"
                >
                  <span>🍲</span>
                  <span>Ẩm thực & Hương sắc buôn làng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Đơn vị chủ quản */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-white">Đơn vị chủ quản</h4>
            <div className="space-y-2.5 text-xs text-stone-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
                <span className="font-bold text-amber-200">ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK (Xã Ea Súp, Tỉnh Đắk Lắk)</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Hotline: <a href="tel:0819701678" className="text-white font-medium hover:text-[#0066CC] transition-colors">0819701678</a> Đặng Văn Tình</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#0066CC] shrink-0" />
                <span>Gmail: <a href="mailto:Dangvantinht@gmail.com" className="text-white font-medium hover:text-[#0066CC] transition-colors">Dangvantinht@gmail.com</a></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className="pt-8 text-center text-xs text-stone-500">
          <p>© 2025 - 2026 DU LỊCH EA SÚP. Bản quyền thuộc ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK (Xã Ea Súp, Tỉnh Đắk Lắk).</p>
        </div>
      </div>
    </footer>
  );
}
