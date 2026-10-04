'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Store,
  Phone,
  MapPin,
  Clock,
  UtensilsCrossed,
  Plus,
  Minus,
  ShoppingCart,
  Calendar,
  ArrowLeft,
  CheckCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { createOrderAction, createBookingAction } from '@/actions/customer-actions';
import { toast } from 'sonner';

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Giỏ hàng đặt món
  const [cart, setCart] = useState<{ [menuItemId: string]: { item: any; quantity: number } }>({});
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Form đặt món
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    note: '',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Form đặt bàn
  const [bookingForm, setBookingForm] = useState({
    customerName: '',
    customerPhone: '',
    bookingTime: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16),
    guestCount: 4,
    note: '',
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Tự động tải thông tin khách hàng đang đăng nhập và tự điền Họ tên + SĐT
  useEffect(() => {
    const autofillCustomerInfo = async () => {
      try {
        let name = '';
        let phone = '';

        // 1. Đọc từ localStorage
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('easup_auth_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (parsed.name) name = parsed.name;
              if (parsed.phone) phone = parsed.phone;
            } catch {}
          }
        }

        // 2. Gọi API auth me để lấy dữ liệu mới nhất
        try {
          const res = await fetch('/api/auth/me');
          const data = await res.json();
          if (data.authenticated && data.user) {
            if (data.user.name) name = data.user.name;
            if (data.user.phone) phone = data.user.phone;
          }
        } catch {}

        if (name || phone) {
          setOrderForm((prev) => ({
            ...prev,
            customerName: prev.customerName || name,
            customerPhone: prev.customerPhone || phone,
          }));
          setBookingForm((prev) => ({
            ...prev,
            customerName: prev.customerName || name,
            customerPhone: prev.customerPhone || phone,
          }));
        }
      } catch (e) {
        console.error('Error autofilling customer info:', e);
      }
    };

    autofillCustomerInfo();
  }, []);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/restaurants/${slug}`);
        const data = await res.json();
        if (data.success) {
          setRestaurant(data.restaurant);
          setMenuItems(data.menuItems || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchRestaurant();
  }, [slug]);

  // Nạp lại thông tin user khi mở modal đặt món hoặc đặt bàn
  const openOrderModal = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('easup_auth_user');
      if (cached) {
        try {
          const u = JSON.parse(cached);
          setOrderForm((prev) => ({
            ...prev,
            customerName: prev.customerName || u.name || '',
            customerPhone: prev.customerPhone || u.phone || '',
          }));
        } catch {}
      }
    }
    setOrderModalOpen(true);
  };

  const openBookingModal = () => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('easup_auth_user');
      if (cached) {
        try {
          const u = JSON.parse(cached);
          setBookingForm((prev) => ({
            ...prev,
            customerName: prev.customerName || u.name || '',
            customerPhone: prev.customerPhone || u.phone || '',
          }));
        } catch {}
      }
    }
    setBookingModalOpen(true);
  };

  // Thêm/giảm giỏ hàng
  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const quantity = existing ? existing.quantity + 1 : 1;
      return { ...prev, [item.id]: { item, quantity } };
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: { ...existing, quantity: existing.quantity - 1 } };
    });
  };

  const cartList = Object.values(cart);
  const totalAmount = cartList.reduce((sum, c) => sum + c.item.price * c.quantity, 0);

  // Xử lý gửi đơn đặt món
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartList.length === 0) {
      toast.error('Vui lòng chọn ít nhất một món ăn');
      return;
    }
    setSubmittingOrder(true);
    try {
      const res = await createOrderAction({
        restaurantId: restaurant.id,
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        note: orderForm.note,
        items: cartList.map((c) => ({
          menuItemId: c.item.id,
          name: c.item.name,
          quantity: c.quantity,
          price: c.item.price,
        })),
      });

      if (res.success) {
        toast.success(res.message);
        setOrderModalOpen(false);
        setCart({});
        router.push('/mon-ngon/lich-su-dat');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đặt món');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Xử lý gửi đặt bàn
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingBooking(true);
    try {
      const res = await createBookingAction({
        restaurantId: restaurant.id,
        customerName: bookingForm.customerName,
        customerPhone: bookingForm.customerPhone,
        bookingTime: bookingForm.bookingTime,
        guestCount: Number(bookingForm.guestCount),
        note: bookingForm.note,
      });

      if (res.success) {
        toast.success(res.message);
        setBookingModalOpen(false);
        router.push('/mon-ngon/lich-su-dat');
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi đặt bàn');
    } finally {
      setSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-[#D9452B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-semibold">Đang chuẩn bị thực đơn quán ăn...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <p className="text-stone-600 font-bold">Không tìm thấy thông tin quán ăn này.</p>
          <Link
            href="/mon-ngon"
            className="inline-flex py-2 px-4 rounded-xl bg-[#D9452B] text-white text-xs font-bold"
          >
            Quay lại Món Ngon Ea Súp
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] pb-32">
      {/* Banner Ảnh & Header Quán */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-stone-900">
        <img
          src={restaurant.coverImage || '/mon-ngon/ga-nuong.jpg'}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/mon-ngon"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-all border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Món Ngon Ea Súp</span>
          </Link>
        </div>

        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#D9452B] text-white">
              {restaurant.village || 'Ea Súp'}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
              Mở cửa: {restaurant.openTime || '08:00'} - {restaurant.closeTime || '22:00'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {restaurant.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/90">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D9452B]" />
              <span>{restaurant.address}</span>
            </p>
            {restaurant.phone && (
              <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1.5 hover:underline">
                <Phone className="w-3.5 h-3.5 text-[#0066CC]" />
                <span className="font-mono font-bold">{restaurant.phone}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* CỘT TRÁI: THỰC ĐƠN MÓN ĂN */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-[#D9452B]" />
                  <span>Thực Đơn Món Ăn</span>
                </h2>
                <p className="text-xs text-stone-500">Chọn món yêu thích để quán chuẩn bị chu đáo</p>
              </div>

              <button
                type="button"
                onClick={openBookingModal}
                className="py-2 px-3.5 rounded-xl border border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt bàn trước</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menuItems.map((item) => {
                const cartQty = cart[item.id]?.quantity || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E7E2D7] p-3.5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100">
                        <img src={item.image || '/mon-ngon/ga-nuong.jpg'} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                          {item.category}
                        </span>
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                            Tạm hết món
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-[#1C1917]">{item.name}</h3>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{item.description}</p>
                        <p className="text-sm font-bold text-[#D9452B] font-mono mt-1">
                          {item.price?.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      {item.isAvailable ? (
                        cartQty > 0 ? (
                          <div className="flex items-center gap-2 bg-[#FDEDE8] rounded-xl px-2 py-1">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded-lg bg-white text-[#D9452B] font-bold flex items-center justify-center shadow-xs"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#D9452B] px-1">{cartQty}</span>
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="w-6 h-6 rounded-lg bg-[#D9452B] text-white font-bold flex items-center justify-center shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="py-1.5 px-3 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Chọn món</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-stone-400 font-semibold italic">Hết món</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI: GIỎ ĐẶT MÓN */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-3xl border border-[#E7E2D7] p-5 shadow-heritage sticky top-24 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-serif font-bold text-base text-[#1C1917] flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-[#D9452B]" />
                  <span>Đơn Đặt Món ({cartList.length})</span>
                </h3>
                {cartList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart({})}
                    className="text-[11px] text-stone-400 hover:text-red-600 transition-colors"
                  >
                    Xóa hết
                  </button>
                )}
              </div>

              {cartList.length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-400 space-y-2">
                  <UtensilsCrossed className="w-8 h-8 mx-auto text-stone-300" />
                  <p>Chưa chọn món nào</p>
                  <p className="text-[11px]">Bấm "+ Chọn món" ở thực đơn bên cạnh</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {cartList.map(({ item, quantity }) => (
                      <div key={item.id} className="flex items-center justify-between text-xs py-1">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="font-bold text-[#1C1917] truncate">{item.name}</p>
                          <p className="text-[11px] text-[#D9452B] font-mono">
                            {item.price.toLocaleString('vi-VN')}đ x {quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="w-5 h-5 rounded bg-stone-100 text-stone-600 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-bold text-xs w-4 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => addToCart(item)}
                            className="w-5 h-5 rounded bg-stone-100 text-stone-600 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 pt-3 space-y-2">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span>Tổng tạm tính:</span>
                      <span className="text-[#D9452B] font-mono text-base">
                        {totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={openOrderModal}
                      className="w-full py-3 rounded-2xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-[#D9452B]/30 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Xác Nhận Đặt Món</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL XÁC NHẬN ĐẶT MÓN */}
      {orderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">Thông Tin Nhận Món</h3>
              <button onClick={() => setOrderModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-3 text-xs">
              <div className="p-3 bg-[#FDEDE8] rounded-xl text-stone-700 space-y-1">
                <p className="font-bold text-[#D9452B]">Quán: {restaurant.name}</p>
                <p>Số lượng món: <strong>{cartList.reduce((s, c) => s + c.quantity, 0)}</strong> • Tổng tiền: <strong className="font-mono text-[#D9452B]">{totalAmount.toLocaleString('vi-VN')}đ</strong></p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Họ và tên của bạn *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn Du Khách"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Số điện thoại liên hệ *</label>
                <input
                  type="tel"
                  required
                  placeholder="VD: 0912 345 678"
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({ ...orderForm, customerPhone: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Ghi chú (giờ đến ăn, khẩu vị...)</label>
                <textarea
                  rows={2}
                  placeholder="VD: 11h30 trưa nay chúng tôi ghé quán, làm ít cay..."
                  value={orderForm.note}
                  onChange={(e) => setOrderForm({ ...orderForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-6 py-2.5 rounded-xl bg-[#D9452B] text-white font-bold hover:bg-[#BF3A22] transition-colors shadow-md shadow-[#D9452B]/30"
                >
                  {submittingOrder ? 'Đang gửi...' : 'Gửi Đơn Đặt Món'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ĐẶT BÀN TRƯỚC */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">Đặt Bàn Trước Tại Quán</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-3 text-xs">
              <div className="p-3 bg-blue-50 rounded-xl text-stone-700 space-y-1">
                <p className="font-bold text-[#0066CC]">Quán: {restaurant.name}</p>
                <p className="text-[11px] text-stone-500">Giữ chỗ trước để quán chuẩn bị không gian chu đáo</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Anh Minh"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="09xx..."
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Ngày giờ đến ăn *</label>
                  <input
                    type="datetime-local"
                    required
                    value={bookingForm.bookingTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, bookingTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Số lượng khách</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={bookingForm.guestCount}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu chòi lá, bàn ngoài trời, tiệc sinh nhật..."
                  value={bookingForm.note}
                  onChange={(e) => setBookingForm({ ...bookingForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="px-6 py-2 rounded-xl bg-[#0066CC] text-white font-bold hover:bg-[#0055AA] transition-colors shadow-md shadow-[#0066CC]/30"
                >
                  {submittingBooking ? 'Đang gửi...' : 'Gửi Đặt Bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
