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
        // Kiểm tra nếu là Chủ quán mà chưa ACTIVE thì không cho duy trì đăng nhập
        if (userDetail.role === 'OWNER' && userDetail.status !== 'ACTIVE') {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('easup_auth_user');
          }
          setCurrentUser(null);
          return;
        }
        setCurrentUser(userDetail);
      } else {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('easup_auth_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.role === 'OWNER' && parsed.status !== 'ACTIVE') {
                localStorage.removeItem('easup_auth_user');
                setCurrentUser(null);
                return;
              }
              setCurrentUser(parsed);
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
        status: (session.user as any).status || 'ACTIVE',
        restaurantName: (session.user as any).restaurantName,
      };
      if (u.role === 'OWNER' && u.status !== 'ACTIVE') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('easup_auth_user');
        }
        setCurrentUser(null);
        return;
      }
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-3">
          {/* Brand Logo & Tiêu Đề */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
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
                <span className="text-[9px] sm:text-[10px] lg:text-[11px] uppercase tracking-wider text-[#A64B2A] font-bold mt-0.5 truncate hidden sm:block">
                  BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
                </span>
              </div>
            </Link>
          </div>

          {/* Các liên kết điều hướng chính (Chỉ hiện trên máy tính md+, trên mobile đưa vào 3 dấu gạch ngang) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 shrink-0">
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
                  className={`flex items-center gap-1.5 py-1.5 px-2.5 lg:px-3 rounded-xl text-xs lg:text-sm font-medium transition-all shrink-0 ${
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
                  <span className="whitespace-nowrap">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Cụm Tài Khoản & Menu 3 Gạch */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cụm Tài Khoản: Trên mobile chỉ để Avatar và chữ "Khách" hoặc "Quán" theo phân quyền */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-white border border-[#E7E2D7] py-1 px-2 rounded-xl shadow-xs shrink-0">
                <div className="w-5 h-5 rounded-full overflow-hidden bg-blue-100 text-[#0066CC] flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name?.charAt(0) || 'U'
                  )}
                </div>
                {/* Tên chỉ hiện trên máy tính (md+), trên điện thoại ẩn đi */}
                <span className="hidden md:inline max-w-[120px] truncate text-xs font-bold text-[#1C1917]">
                  {currentUser.name}
                </span>
                {/* Badge phân quyền rút gọn: "Quán" hoặc "Khách" hoặc "Admin" */}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-[#0066CC] text-white'
                      : currentUser.role === 'OWNER'
                      ? 'bg-[#D9452B] text-white'
                      : 'bg-stone-100 text-stone-700 border border-stone-200'
                  }`}
                >
                  {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.role === 'OWNER' ? 'Quán' : 'Khách'}
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
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-[#1C1917] text-white hover:bg-[#D9452B] transition-all shadow-xs shrink-0"
              >
                <LogIn className="w-4 h-4 shrink-0" />
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Menu 3 gạch: Chứa toàn bộ liên kết trên mobile */}
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
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-[#E7E2D7] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Trên mobile: Đưa các nút vào trong 3 dấu gạch ngang */}
                  <div className="md:hidden space-y-1 pb-2 mb-2 border-b border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-0.5">
                      Khám phá du lịch
                    </p>
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive =
                        link.href.includes('#')
                          ? false
                          : link.href === '/'
                          ? pathname === '/' || pathname.startsWith('/mon-ngon')
                          : pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                            isActive
                              ? link.accent
                                ? 'bg-[#D9452B] text-white'
                                : 'bg-[#0066CC] text-white'
                              : 'text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{link.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mục Chủ Quán & Quản Trị */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-0.5 md:hidden">
                      Hệ thống
                    </p>
                    <Link
                      id="nav-menu-chu-quan"
                      href="/chu-quan"
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
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
                </div>
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
