'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Landmark, Calendar, ShieldCheck, Headphones } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Di sản & Danh thắng', href: '/#danh-thang', icon: Landmark },
    { name: 'Bản đồ', href: '/#ban-do-du-lich', icon: MapPin },
    { name: 'Lịch trình du lịch', href: '/#lich-trinh', icon: Calendar },
    { name: 'Thuyết minh số', href: '/#thuyet-minh-so', icon: Headphones },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FBF9F5]/95 backdrop-blur-md shadow-sm border-b border-[#E7E2D7]'
          : 'bg-[#FBF9F5]/90 backdrop-blur-sm border-b border-[#E7E2D7]/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2 md:py-0 md:h-20 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-4">
        {/* HÀNG 1: Brand Logo & 2 Dòng Tiêu Đề Chiếm Trọn Không Gian Rộng Nhất */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-1 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#0066CC] shadow-md group-hover:scale-105 transition-transform shrink-0 bg-white">
              <img
                src="/logo-easup-official.png"
                alt="Logo Xã Ea Súp"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[#1C1917] tracking-tight block leading-tight truncate">
                DU LỊCH EA SÚP
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#A64B2A] font-bold block mt-0.5 truncate">
                BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
              </span>
            </div>
          </Link>
        </div>

        {/* HÀNG 2 TRÊN MOBILE: Dòng biểu tượng liên kết xuống dưới tiêu đề / Desktop: menu ngang bên phải */}
        <div className="flex items-center justify-between md:justify-end gap-1 sm:gap-2 pt-1.5 md:pt-0 border-t border-[#E7E2D7]/50 md:border-t-0 w-full md:w-auto">
          {/* Navigation Links */}
          <nav className="flex items-center justify-around md:justify-start gap-1 sm:gap-1.5 lg:gap-2 flex-1 md:flex-none">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  title={link.name}
                  aria-label={link.name}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-3 sm:px-3 md:px-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'text-[#0066CC] bg-[#0066CC]/10 font-semibold shadow-xs'
                      : 'text-[#1C1917]/80 hover:text-[#0066CC] hover:bg-[#0066CC]/5'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-[#0066CC] shrink-0" />
                  <span className="hidden md:inline whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Button: Admin CMS */}
          <div className="flex items-center shrink-0 pl-1 md:pl-2">
            <Link
              href="/admin"
              title="Ban Quản Trị"
              aria-label="Ban Quản Trị"
              className="flex items-center gap-1.5 py-1.5 px-3 sm:px-3 md:px-4 rounded-xl text-xs font-semibold text-[#0066CC] border border-[#0066CC]/30 hover:border-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-all shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Ban Quản Trị</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
