'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Phone,
  Store,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Bell,
  Trash2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  getCustomerOrdersAndBookings,
  cancelOrderAction,
  cancelBookingAction,
  getCustomerNotificationsAction,
  markNotificationAsReadAction,
} from '@/actions/customer-actions';
import { toast } from 'sonner';

export default function CustomerHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'notifications'>('orders');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCustomerOrdersAndBookings();
      if (res.success) {
        setOrders(res.orders);
        setBookings(res.bookings);
      }
      const notifRes = await getCustomerNotificationsAction();
      if (notifRes.success) {
        setNotifications(notifRes.notifications);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Vui lòng đăng nhập để xem lịch sử.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hủy đơn đặt món
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn đặt món này?')) return;
    try {
      const res = await cancelOrderAction(orderId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Hủy đặt bàn
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đặt bàn này?')) return;
    try {
      const res = await cancelBookingAction(bookingId);
      if (res.success) {
        toast.success(res.message);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Đọc thông báo
  const handleReadNotif = async (id: string) => {
    await markNotificationAsReadAction(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#D9452B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-semibold">Đang tải lịch sử đặt món của bạn...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-[#1C1917]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E2D7] p-8 shadow-heritage text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FDEDE8] text-[#D9452B] flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
            Lịch Sử Đặt Món & Đặt Bàn
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">{authError}</p>
          <div className="pt-2">
            <Link
              href="/mon-ngon"
              className="inline-flex py-2.5 px-5 rounded-xl bg-[#D9452B] text-white text-xs font-bold hover:bg-[#BF3A22] transition-colors"
            >
              Về trang Món Ngon Ea Súp
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Nút quay lại */}
        <div className="flex items-center justify-between">
          <Link
            href="/mon-ngon"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#D9452B] transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#E7E2D7] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Món Ngon Ea Súp</span>
          </Link>
          <span className="text-xs text-stone-400 font-medium">Bảo mật: Chỉ hiển thị đơn của tài khoản bạn</span>
        </div>

        {/* Tiêu đề */}
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Lịch Sử Đặt Món & Đặt Bàn Của Bạn
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Theo dõi tiến độ đơn ăn, nhận thông báo xác nhận từ các chủ quán tại Ea Súp
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[#E7E2D7] pb-3 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Đơn Đặt Món ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Đặt Bàn ({bookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'notifications'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Thông Báo Quán Duyệt {unreadNotifsCount > 0 && `(${unreadNotifsCount} mới)`}</span>
          </button>
        </div>

        {/* TAB 1: ĐƠN ĐẶT MÓN */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E2D7] p-10 text-center text-xs text-stone-500 space-y-3">
                <UtensilsCrossed className="w-10 h-10 mx-auto text-stone-300" />
                <p>Bạn chưa đặt món ăn nào tại các quán ở Ea Súp.</p>
                <Link
                  href="/mon-ngon"
                  className="inline-flex py-2 px-4 rounded-xl bg-[#D9452B] text-white font-bold"
                >
                  Khám phá quán ngon ngay
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E7E2D7] p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#D9452B]" />
                      <span className="font-bold text-sm text-[#1C1917]">
                        {order.restaurant?.name || 'Quán ăn Ea Súp'}
                      </span>
                      {order.restaurant?.slug && (
                        <Link
                          href={`/mon-ngon/${order.restaurant.slug}`}
                          className="text-[11px] text-[#0066CC] hover:underline flex items-center gap-0.5"
                        >
                          <span>Xem quán</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          order.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : order.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'CANCELLED' || order.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-[#0066CC]'
                        }`}
                      >
                        {order.status === 'PENDING'
                          ? 'Chờ quán phê duyệt'
                          : order.status === 'APPROVED'
                          ? 'Quán đã xác nhận'
                          : order.status === 'CANCELLED'
                          ? 'Đã hủy'
                          : order.status === 'REJECTED'
                          ? 'Quán từ chối'
                          : 'Đã hoàn thành'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')} {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết các món */}
                  <div className="bg-stone-50 rounded-2xl p-3.5 space-y-2 text-xs">
                    {order.orderItems?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-stone-700">
                        <span className="font-medium">
                          {item.menuItem?.name || 'Món ăn'} <strong className="text-[#D9452B]">x{item.quantity}</strong>
                        </span>
                        <span className="font-mono text-stone-500">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 pt-2 flex justify-between items-center font-bold text-sm">
                      <span>Tổng số tiền:</span>
                      <span className="text-[#D9452B] font-mono text-base">
                        {order.totalAmount?.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>

                  {/* Footer thông tin nhận & nút hủy */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-stone-500 space-y-0.5">
                      <p>Khách nhận: <strong>{order.customerName}</strong> ({order.customerPhone})</p>
                      {order.note && <p className="italic">Ghi chú: "{order.note}"</p>}
                    </div>

                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        className="py-1.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors self-start sm:self-auto"
                      >
                        Hủy đơn đặt món này
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: LỊCH ĐẶT BÀN */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E2D7] p-10 text-center text-xs text-stone-500">
                Bạn chưa có lịch hẹn đặt bàn nào tại các quán ở Ea Súp.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-3xl border border-[#E7E2D7] p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#0066CC]" />
                      <span className="font-bold text-sm text-[#1C1917]">
                        {booking.restaurant?.name || 'Quán ăn Ea Súp'}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        booking.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : booking.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {booking.status === 'PENDING'
                        ? 'Chờ quán xác nhận bàn'
                        : booking.status === 'APPROVED'
                        ? 'Đã xác nhận giữ bàn'
                        : 'Đã hủy'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5 font-semibold text-[#0066CC]">
                      <Clock className="w-4 h-4" />
                      <span>Giờ hẹn: {new Date(booking.bookingTime).toLocaleString('vi-VN')}</span>
                    </p>
                    <p>Số lượng: <strong>{booking.guestCount} người</strong></p>
                    {booking.note && <p className="italic sm:col-span-2">Ghi chú: "{booking.note}"</p>}
                  </div>

                  {booking.status === 'PENDING' && (
                    <div className="pt-2 border-t border-stone-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="py-1 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                      >
                        Hủy lịch hẹn đặt bàn
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: HỘP THƯ THÔNG BÁO */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E7E2D7] p-10 text-center text-xs text-stone-500">
                Chưa có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleReadNotif(n.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1 ${
                    n.isRead
                      ? 'bg-white border-[#E7E2D7] text-stone-700'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{n.title}</span>
                    </p>
                    <span className="text-[10px] text-stone-400">
                      {new Date(n.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed pl-5.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
