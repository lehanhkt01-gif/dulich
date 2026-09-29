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
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FBF9F5]/90 backdrop-blur-md shadow-sm border-b border-[#E7E2D7]'
          : 'bg-[#FBF9F5]/70 backdrop-blur-sm border-b border-[#E7E2D7]/50'
      }`}
    >
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo Xã Ea Súp */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#0066CC] shadow-md group-hover:scale-105 transition-transform shrink-0 bg-white">
            <img
              src="/logo-easup-official.png"
              alt="Logo Xã Ea Súp"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[#1C1917] tracking-tight block leading-none">
              DU LỊCH EA SÚP
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#A64B2A] font-bold block mt-1">
              BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
            </span>
          </div>
        </Link>

        {/* Navigation Links: Trên điện thoại chỉ hiện mỗi biểu tượng, trên desktop hiện icon + chữ */}
        <nav className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                title={link.name}
                aria-label={link.name}
                className={`flex items-center justify-center gap-1.5 p-2 sm:px-2.5 sm:py-2 md:px-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#0066CC] bg-[#0066CC]/10 font-semibold shadow-xs'
                    : 'text-[#1C1917]/80 hover:text-[#0066CC] hover:bg-[#0066CC]/5'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-4 sm:h-4 text-[#0066CC]/80 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Button: Admin CMS */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin"
            title="Ban Quản Trị"
            aria-label="Ban Quản Trị"
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 md:px-4 rounded-xl text-xs font-semibold text-[#0066CC] border border-[#0066CC]/30 hover:border-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="hidden lg:inline">Ban Quản Trị</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
