'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Landmark, Calendar, ShieldCheck, Menu, X, Headphones } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { name: 'Bản đồ GIS', href: '/#ban-do-du-lich', icon: MapPin },
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[#0066CC] bg-[#0066CC]/10 font-semibold'
                    : 'text-[#1C1917]/80 hover:text-[#0066CC] hover:bg-[#0066CC]/5'
                }`}
              >
                <Icon className="w-4 h-4 text-[#0066CC]/80" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons: Pre-flight Review & Admin CMS */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/review"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A64B2A] bg-[#A64B2A]/10 hover:bg-[#A64B2A] hover:text-white transition-all shadow-sm"
            title="Kiểm tra hệ thống trước khi deploy VPS"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Nghiệm Thu Deploy</span>
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0066CC] border border-[#0066CC]/30 hover:border-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-all shadow-sm"
          >
            <span>Ban Quản Trị</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-[#1C1917] hover:bg-stone-200/50"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FBF9F5] border-b border-[#E7E2D7] px-4 pt-3 pb-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-[#1C1917] hover:bg-[#0066CC]/10 hover:text-[#0066CC]"
              >
                <Icon className="w-5 h-5 text-[#0066CC]" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-2 border-t border-stone-200">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-[#0066CC] text-white font-medium text-sm shadow-md"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Đăng nhập Ban Quản Trị CMS</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
