'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  ShoppingBag,
  Calendar,
  AlertCircle,
  Sparkles,
  Store,
  ExternalLink,
  X,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

interface NotificationBellProps {
  currentUser: {
    id?: string;
    role?: string;
    name?: string;
  } | null;
}

function timeAgo(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffSec) || diffSec < 60) return 'Vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export default function NotificationBell({ currentUser }: NotificationBellProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Tải thông báo
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // Bỏ qua lỗi ngầm
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Polling định kỳ mỗi 30s
      const timer = setInterval(fetchNotifications, 30000);
      return () => clearInterval(timer);
    }
  }, [currentUser?.id]);

  // Click ngoài đóng popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Đánh dấu 1 tin đã đọc
  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (e) {}
    }
    setOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      setLoading(true);
      await fetch('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  const isOwner = currentUser.role === 'OWNER';

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Nút Chuông */}
      <button
        type="button"
        id="nav-notification-bell-btn"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        aria-label="Thông báo"
        className={`relative p-2 rounded-xl border transition-all flex items-center justify-center ${
          open
            ? 'bg-amber-50 border-[#D9452B] text-[#D9452B]'
            : 'bg-white border-[#E7E2D7] text-stone-700 hover:bg-stone-50 hover:text-[#D9452B]'
        } shadow-xs`}
        title={unreadCount > 0 ? `Bạn có ${unreadCount} thông báo mới` : 'Hộp thông báo'}
      >
        <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-[#D9452B] animate-wiggle' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Danh Sách Thông Báo */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E7E2D7] shadow-2xl p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-[#FBF9F5] border-b border-[#E7E2D7] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-[#1C1917]">Thông Báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={loading}
                className="text-[11px] font-semibold text-[#0066CC] hover:text-[#0052A3] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-stone-700">Bạn chưa có thông báo nào</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {isOwner
                    ? 'Khi khách đặt món, đặt bàn hoặc hủy đơn, thông báo sẽ hiển thị tại đây.'
                    : 'Khi quán xác nhận đơn hoặc bàn đặt, thông báo sẽ hiển thị tại đây.'}
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = !n.isRead;
                const type = n.type || '';
                const isOrder = type === 'ORDER' || n.title.includes('đặt món');
                const isBooking = type === 'BOOKING' || n.title.includes('đặt bàn');
                const isCancel = type === 'CANCEL' || n.title.includes('hủy');

                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer text-left ${
                      isUnread
                        ? 'bg-blue-50/50 hover:bg-blue-50'
                        : 'bg-white hover:bg-stone-50'
                    }`}
                  >
                    {/* Icon đại diện */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                        isCancel
                          ? 'bg-rose-100 text-rose-700'
                          : isOrder
                          ? 'bg-blue-100 text-blue-700'
                          : isBooking
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isCancel ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : isOrder ? (
                        <ShoppingBag className="w-4 h-4" />
                      ) : isBooking ? (
                        <Calendar className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p
                          className={`text-xs truncate ${
                            isUnread ? 'font-bold text-stone-900' : 'font-semibold text-stone-700'
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-stone-400 shrink-0 font-mono">
                          {timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 leading-snug">
                        {n.message}
                      </p>
                    </div>

                    {/* Chấm xanh chưa đọc */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#0066CC] shrink-0 mt-1.5 ring-2 ring-blue-100" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#FBF9F5] border-t border-[#E7E2D7] text-center">
            {isOwner ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push('/chu-quan/dashboard');
                }}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-[#D9452B] hover:bg-orange-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Xem Không Gian Quán & Đơn Hàng</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push('/mon-ngon/lich-su-dat');
                }}
                className="w-full py-1.5 px-3 rounded-xl text-xs font-semibold text-[#0066CC] hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Xem Lịch Sử Đặt Món & Bàn Của Bạn</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
