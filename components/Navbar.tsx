'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import {
  MapPin,
  Landmark,
  Calendar,
  ShieldCheck,
  UtensilsCrossed,
  Store,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  X as CloseIcon,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register_owner'>('login');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Đóng menu 3 gạch khi bấm ra ngoài hoặc đổi trang
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const fetchAuthUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        let userDetail = data.user;
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('easup_auth_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.email === data.user.email) {
                userDetail = { ...data.user, ...parsed };
              }
            } catch (e) {}
          }
        }
        setCurrentUser(userDetail);
      } else {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('easup_auth_user');
          if (cached) {
            try {
              setCurrentUser(JSON.parse(cached));
            } catch (e) {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchAuthUser();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);



  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      const u = {
        id: session.user.id || (session.user as any).sub || 'google-user',
        name: session.user.name || 'Người dùng Google',
        email: session.user.email || '',
        avatar: session.user.image,
        role: (session.user as any).role || 'TRAVELER',
        restaurantName: (session.user as any).restaurantName,
      };
      setCurrentUser(u);
      if (typeof window !== 'undefined') {
        localStorage.setItem('easup_auth_user', JSON.stringify(u));
      }
    }
  }, [session]);

  const handleLogout = async () => {
    try {
      // 1. Xóa cookie JWT httpOnly phía server
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    try {
      // 2. Đăng xuất NextAuth session (Google)
      await nextAuthSignOut({ redirect: false });
    } catch {}

    // 3. Dọn sạch toàn bộ localStorage & sessionStorage client
    if (typeof window !== 'undefined') {
      localStorage.removeItem('easup_auth_user');
      localStorage.removeItem('admin_user');
      sessionStorage.clear();
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    setCurrentUser(null);

    // 4. Nếu đang ở trang quản trị hoặc trang chủ quán thì điều hướng về trang chủ
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/chu-quan')) {
        window.location.href = '/';
      } else {
        window.location.reload();
      }
    }
  };

  const navLinks = [
    { name: 'Món ngon Ea Súp', href: '/', icon: UtensilsCrossed, accent: true },
    { name: 'Điểm đến du lịch', href: '/diem-den', icon: Landmark },
    { name: 'Bản đồ', href: '/diem-den#ban-do-du-lich', icon: MapPin },
    { name: 'Lịch trình du lịch', href: '/diem-den#lich-trinh', icon: Calendar },
  ];

  const showAdminLink =
    !currentUser ||
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'CADRE' ||
    currentUser.role === 'EDITOR';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#FBF9F5]/95 backdrop-blur-md shadow-sm border-b border-[#E7E2D7]'
            : 'bg-[#FBF9F5]/90 backdrop-blur-sm border-b border-[#E7E2D7]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2 md:py-0 md:h-20 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-3">
          {/* HÀNG 1: Brand Logo & 2 Dòng Tiêu Đề */}
          <div className="flex items-center justify-between w-full md:w-auto shrink-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group flex-1 md:flex-initial min-w-0">
              <div className="w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden border-2 border-[#0066CC] shadow-md group-hover:scale-105 transition-transform shrink-0 bg-white">
                <img
                  src="/logo-easup-official.png"
                  alt="Logo Xã Ea Súp"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-base sm:text-lg lg:text-xl text-[#1C1917] tracking-tight block leading-tight truncate">
                  DU LỊCH EA SÚP
                </span>
                <span className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-[#A64B2A] font-bold block mt-0.5 truncate">
                  BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
                </span>
              </div>
            </Link>
          </div>

          {/* HÀNG 2 TRÊN MOBILE / MENU NGANG TRÊN DESKTOP */}
          <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 pt-1.5 md:pt-0 border-t border-[#E7E2D7]/50 md:border-t-0 w-full md:w-auto">
            {/* Các liên kết điều hướng chính */}
            <nav className="flex items-center justify-around md:justify-start gap-1 sm:gap-1.5 flex-1 md:flex-none overflow-x-auto no-scrollbar">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  link.href.includes('#')
                    ? false
                    : link.href === '/'
                    ? pathname === '/' || pathname.startsWith('/mon-ngon')
                    : pathname.startsWith(link.href);
                const accent = 'accent' in link && link.accent;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={link.name}
                    aria-label={link.name}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-2.5 lg:px-3 rounded-xl text-xs lg:text-sm font-medium transition-all shrink-0 ${
                      accent
                        ? isActive
                          ? 'text-white bg-[#D9452B] font-semibold shadow-sm'
                          : 'text-[#D9452B] bg-[#D9452B]/10 hover:bg-[#D9452B] hover:text-white font-semibold'
                        : isActive
                          ? 'text-[#0066CC] bg-[#0066CC]/10 font-semibold shadow-xs'
                          : 'text-[#1C1917]/80 hover:text-[#0066CC] hover:bg-[#0066CC]/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${accent ? '' : 'text-[#0066CC]'}`} />
                    <span className="hidden md:inline whitespace-nowrap">{link.name}</span>
                    {accent && <span className="md:hidden whitespace-nowrap text-xs font-semibold">Món ngon</span>}
                  </Link>
                );
              })}
            </nav>

            {/* CỤM NÚT: ĐĂNG NHẬP / PROFILE & MENU 3 GẠCH (Chủ Quán, Quản Trị) */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Menu 3 gạch: Chủ Quán & Quản Trị */}
              <div className="relative" ref={menuRef}>
                <button
                  id="nav-more-menu-btn"
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                  className="p-2 rounded-xl border border-[#E7E2D7] bg-white text-[#1C1917] hover:bg-stone-100 transition-colors shadow-xs"
                >
                  {menuOpen ? <CloseIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-[#E7E2D7] shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <Link
                      id="nav-menu-chu-quan"
                      href="/chu-quan"
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        pathname.startsWith('/chu-quan')
                          ? 'bg-[#D9452B] text-white'
                          : 'text-[#D9452B] hover:bg-[#FDEDE8]'
                      }`}
                    >
                      <Store className="w-4 h-4 shrink-0" />
                      <span>Chủ Quán</span>
                    </Link>

                    {showAdminLink && (
                      <Link
                        id="nav-menu-quan-tri"
                        href="/admin"
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          pathname.startsWith('/admin')
                            ? 'bg-[#0066CC] text-white'
                            : 'text-[#0066CC] hover:bg-blue-50'
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>Quản Trị</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Cụm Tài Khoản: Đăng Nhập hoặc Thông tin + Đăng xuất */}
              {currentUser ? (
                <div className="flex items-center gap-1.5 bg-white border border-[#E7E2D7] py-1 px-2 rounded-xl shadow-xs shrink-0">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-100 text-[#0066CC] flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <span className="max-w-[70px] sm:max-w-[95px] truncate text-xs font-bold text-[#1C1917]">
                    {currentUser.name}
                  </span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-[#0066CC] text-white'
                        : currentUser.role === 'OWNER'
                        ? 'bg-[#D9452B] text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {currentUser.role === 'ADMIN' ? 'ADMIN' : currentUser.role === 'OWNER' ? 'QUÁN' : 'KHÁCH'}
                  </span>

                  {/* Nút Đăng Xuất */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Đăng xuất tài khoản"
                    className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-xl text-xs font-bold bg-[#1C1917] text-white hover:bg-[#D9452B] transition-all shadow-xs shrink-0"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
          fetchAuthUser();
        }}
      />
    </>
  );
}
