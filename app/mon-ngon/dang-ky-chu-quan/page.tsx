'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Camera,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Info,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { registerOwnerAction } from '@/actions/auth-actions';
import { toast } from 'sonner';

export default function DangKyChuQuanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; restaurant: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    restaurantAddress: '',
    village: '',
    lat: '',
    lng: '',
    openTime: '08:00',
    closeTime: '21:30',
    coverImage: '/mon-ngon/ga-nuong.jpg',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.restaurantName) {
      toast.error('Vui lòng điền đầy đủ các thông tin có dấu sao (*).');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast.error('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    setLoading(true);
    try {
      const latNum = formData.lat.trim() !== '' ? parseFloat(formData.lat) : undefined;
      const lngNum = formData.lng.trim() !== '' ? parseFloat(formData.lng) : undefined;
      const res = await registerOwnerAction({
        ...formData,
        lat: latNum !== undefined && !isNaN(latNum) ? latNum : null,
        lng: lngNum !== undefined && !isNaN(lngNum) ? lngNum : null,
      });
      if (res.success) {
        setSuccessInfo({
          name: formData.name,
          restaurant: formData.restaurantName,
        });
        setSubmitted(true);
        toast.success(res.message);
      } else {
        toast.error(res.message || 'Đăng ký thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Nút quay lại */}
        <div className="mb-6">
          <Link
            href="/mon-ngon"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#D9452B] transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#E7E2D7] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Món Ngon Ea Súp</span>
          </Link>
        </div>

        {submitted ? (
          /* MÀN HÌNH THÔNG BÁO CHỜ PHÊ DUYỆT */
          <div className="bg-white rounded-3xl border border-[#E7E2D7] p-8 sm:p-10 shadow-heritage text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                <Info className="w-3.5 h-3.5" />
                Trạng thái: Đang chờ xét duyệt (PENDING)
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
                Đăng Ký Hồ Sơ Quán Ăn Thành Công!
              </h1>
              <p className="text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
                Hồ sơ quán <strong>"{successInfo?.restaurant}"</strong> của chủ quán{' '}
                <strong>{successInfo?.name}</strong> đã được gửi tới Ban Quản Trị Hệ Thống Ea Súp.
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 text-left space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Quy trình xác minh địa phương:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-700">
                <li>Cán bộ phụ trách văn hóa - du lịch hoặc Ban Quản Trị sẽ xác thực thông tin quán và số điện thoại liên hệ.</li>
                <li>Sau khi được phê duyệt (ACTIVE), bạn sẽ nhận được thông báo kích hoạt và có thể đăng nhập vào Không Gian Chủ Quán để bắt đầu đăng tải thực đơn và nhận đơn đặt bàn.</li>
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/mon-ngon/dang-nhap-chu-quan"
                className="py-3 px-6 rounded-2xl bg-[#D9452B] text-white text-xs font-bold hover:bg-[#BF3A22] transition-colors shadow-md shadow-[#D9452B]/30 flex items-center justify-center gap-2"
              >
                <Store className="w-4 h-4" />
                <span>Trang Đăng Nhập Chủ Quán</span>
              </Link>
              <Link
                href="/mon-ngon"
                className="py-3 px-6 rounded-2xl bg-white border border-[#E7E2D7] text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors flex items-center justify-center"
              >
                Khám phá ẩm thực Ea Súp
              </Link>
            </div>
          </div>
        ) : (
          /* FORM ĐĂNG KÝ HỒ SƠ CHỦ QUÁN */
          <div className="bg-white rounded-3xl border border-[#E7E2D7] p-6 sm:p-8 shadow-heritage">
            <div className="flex items-center gap-3 pb-6 border-b border-[#E7E2D7]">
              <div className="w-12 h-12 rounded-2xl bg-[#FDEDE8] text-[#D9452B] flex items-center justify-center font-bold shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Đăng Ký Mở Quán Ăn Tại Ea Súp
                </h1>
                <p className="text-xs text-stone-500">
                  Hệ thống số hóa ẩm thực & kết nối du khách của Đoàn Thanh Niên Ea Súp
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Box quyền lợi */}
              <div className="p-4 bg-[#FDEDE8]/60 border border-[#D9452B]/20 rounded-2xl text-xs text-[#2B1D16] space-y-1">
                <p className="font-bold text-[#D9452B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Quyền lợi Chủ Quán Ăn (Role OWNER):
                </p>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Được hiển thị quán trên bản đồ số Ea Súp, toàn quyền quản lý thực đơn món ngon, bàn ăn và tiếp nhận đơn đặt món / đặt bàn trực tuyến từ du khách.
                </p>
              </div>

              {/* Thông tin quán */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  1. Thông tin quán ăn / nhà hàng
                </h2>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Tên Quán Ăn / Nhà Hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Gà Nướng Cơm Lam Bản Đôn Ea Súp"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] focus:ring-2 focus:ring-[#D9452B]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Địa chỉ cụ thể quán ăn/uống <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Số 45 Đường Hùng Vương, Buôn A2, Thị trấn Ea Súp"
                    value={formData.restaurantAddress}
                    onChange={(e) => setFormData({ ...formData, restaurantAddress: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                  />
                </div>

                {/* Tọa độ vị trí quán X, Y (Kinh độ, Vĩ độ) - Không bắt buộc */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1C1917]">
                      Tọa độ vị trí quán (X, Y) <span className="text-stone-400 font-normal text-[11px]">(Không bắt buộc)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setFormData((prev) => ({
                                ...prev,
                                lng: pos.coords.longitude.toFixed(6),
                                lat: pos.coords.latitude.toFixed(6),
                              }));
                              toast.success('Đã lấy tọa độ GPS thành công!');
                            },
                            (err) => {
                              toast.error('Không thể lấy vị trí: ' + (err.message || 'Quyền vị trí bị từ chối'));
                            }
                          );
                        } else {
                          toast.error('Trình duyệt không hỗ trợ GPS');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-[#0066CC] hover:underline font-semibold"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Lấy vị trí hiện tại</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Tọa độ X (Kinh độ / Longitude)
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="VD: 107.881234"
                        value={formData.lng}
                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                        Tọa độ Y (Vĩ độ / Latitude)
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="VD: 13.245678"
                        value={formData.lat}
                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    💡 Giúp ghim quán chính xác trên bản đồ du lịch số Ea Súp và hỗ trợ du khách tìm đường.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Giờ mở cửa
                    </label>
                    <input
                      type="time"
                      value={formData.openTime}
                      onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Giờ đóng cửa
                    </label>
                    <input
                      type="time"
                      value={formData.closeTime}
                      onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ chủ quán */}
              <div className="space-y-4 pt-3 border-t border-[#E7E2D7]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  2. Thông tin Chủ quán & Tài khoản liên kết
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Họ tên chủ quán <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Y Krông Hmok / Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Số điện thoại nhận đơn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0987 654 321"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Tài khoản Google Gmail đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="VD: chuquan.easup@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all font-mono"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    Dùng chính Gmail này để đăng nhập vào Không Gian Chủ Quán sau khi Ban Quản Trị phê duyệt.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Mật khẩu khởi tạo <span className="text-red-500">*</span> (tối thiểu 6 ký tự)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Tối thiểu 6 ký tự..."
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                      Nhập lại mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập lại mật khẩu..."
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút gửi */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#D9452B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Store className="w-4 h-4" />
                  )}
                  <span>Gửi Hồ Sơ Đăng Ký Chủ Quán</span>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-stone-500">
                  Đã có tài khoản được duyệt?{' '}
                  <Link
                    href="/mon-ngon/dang-nhap-chu-quan"
                    className="text-[#D9452B] font-bold hover:underline"
                  >
                    Đăng nhập Chủ Quán tại đây
                  </Link>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
