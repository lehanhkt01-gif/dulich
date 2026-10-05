'use client';

import React, { useState, useEffect } from 'react';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import GoogleSignInButton from './GoogleSignInButton';
import {
  X,
  Store,
  Compass,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Phone,
  MapPin,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Navigation,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  defaultMode?: 'login' | 'register_owner';
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  defaultMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register_owner'>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Chủ quán
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    restaurantAddress: '',
    restaurantLat: 13.2456,
    restaurantLng: 107.8381,
  });

  // Toggle ẩn/hiện mật khẩu
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // Sub-tab dành riêng cho Chủ Quán
  const [ownerSubTab, setOwnerSubTab] = useState<'login' | 'register'>('login');
  const [ownerLoginGmail, setOwnerLoginGmail] = useState('');
  const [ownerLoginPassword, setOwnerLoginPassword] = useState('');
  const [ownerRegisterPassword, setOwnerRegisterPassword] = useState('');
  const [ownerRegisterConfirmPassword, setOwnerRegisterConfirmPassword] = useState('');

  useEffect(() => {
    setMode(defaultMode);
    setError('');
    setSuccessMsg('');
  }, [defaultMode, isOpen]);

  if (!isOpen) return null;

  // Xử lý gửi login Google
  const handleGoogleAuth = async (
    targetEmail: string,
    targetName: string,
    role: 'TRAVELER' | 'OWNER' | 'ADMIN' | 'EDITOR' = 'TRAVELER',
    extraData: any = {}
  ) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleProfile: {
            email: targetEmail,
            name: targetName,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}`,
          },
          roleRequest: role,
          ...extraData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập Google thất bại');
      }

      // Lưu vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('easup_auth_user', JSON.stringify(data.user));
      }

      if (data.user.role === 'OWNER') {
        if (data.user.status === 'PENDING') {
          setSuccessMsg(`Hồ sơ mở quán "${data.user.restaurantName || ''}" đã gửi! Đang chờ Ban Quản Trị phê duyệt để kích hoạt.`);
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
          }, 2200);
          return;
        } else if (data.user.status === 'BLOCKED') {
          throw new Error('Tài khoản quán của bạn đã bị tạm khóa bởi Ban Quản Trị.');
        } else {
          // Chủ quán đã được duyệt ACTIVE: Vào trực tiếp giao diện quán của mình
          setSuccessMsg(`Chào mừng ${data.user.name}! Đang mở Không Gian Quán của bạn...`);
          setTimeout(() => {
            onSuccess(data.user);
            onClose();
            window.location.href = '/chu-quan';
          }, 700);
          return;
        }
      } else {
        // Khách hàng: tự động kích hoạt ngay không cần phê duyệt
        setSuccessMsg(`Chào mừng ${data.user.name} (Khách du lịch)! Đăng nhập thành công.`);
        setTimeout(() => {
          onSuccess(data.user);
          onClose();
          window.location.reload();
        }, 700);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };


  // Submit đăng nhập chủ quán bằng Gmail và Mật khẩu
  const handleOwnerPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerLoginGmail.includes('@')) {
      setError('Vui lòng nhập tài khoản Gmail hợp lệ');
      return;
    }
    if (!ownerLoginPassword) {
      setError('Vui lòng nhập mật khẩu quán của bạn');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: ownerLoginGmail.trim(),
          password: ownerLoginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.status === 'PENDING' || res.status === 403) {
          setError(
            data.message ||
              'Tài khoản Quán của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng liên hệ Admin để được kích hoạt trước khi đăng nhập.'
          );
          return;
        }
        throw new Error(data.message || 'Gmail hoặc mật khẩu không chính xác');
      }

      // Kiểm tra nếu vai trò không phải OWNER hay ADMIN
      if (data.user.role !== 'OWNER' && data.user.role !== 'ADMIN') {
        throw new Error('Tài khoản này là Khách du lịch. Vui lòng đăng nhập ở tab Khách Du Lịch.');
      }

      // Kiểm tra nghiêm ngặt: Chủ quán bắt buộc phải ACTIVE mới được vào Không Gian Quán
      if (data.user.role === 'OWNER' && data.user.status !== 'ACTIVE') {
        setError(
          'Tài khoản Quán của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng quay lại sau khi đã được Admin kích hoạt.'
        );
        return;
      }

      // Lưu thông tin đăng nhập vào localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('easup_auth_user', JSON.stringify(data.user));
      }

      setSuccessMsg(`Chào mừng ${data.user.name}! Đang mở Không Gian Quán của bạn...`);
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
        window.location.href = '/chu-quan';
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  // Submit đăng ký chủ quán mới (kèm Gmail và mật khẩu)
  const handleSubmitOwnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerForm.email.includes('@')) {
      setError('Vui lòng nhập tài khoản Gmail hợp lệ');
      return;
    }
    if (!ownerForm.restaurantName) {
      setError('Vui lòng nhập tên quán ăn của bạn');
      return;
    }
    if (!ownerRegisterPassword || ownerRegisterPassword.length < 6) {
      setError('Mật khẩu khởi tạo phải có tối thiểu 6 ký tự');
      return;
    }
    if (ownerRegisterPassword !== ownerRegisterConfirmPassword) {
      setError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMsg('');

      // Gọi API tạo tài khoản chủ quán vai trò OWNER kèm tọa độ GPS
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerForm.name || 'Chủ Quán Ea Súp',
          email: ownerForm.email.trim(),
          password: ownerRegisterPassword,
          role: 'OWNER',
          phone: ownerForm.phone,
          restaurantName: ownerForm.restaurantName,
          restaurantAddress: ownerForm.restaurantAddress || 'Xã Ea Súp, Tỉnh Đắk Lắk',
          restaurantLat: Number(ownerForm.restaurantLat) || 13.2456,
          restaurantLng: Number(ownerForm.restaurantLng) || 107.8381,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi đăng ký hồ sơ quán');
      }

      setSuccessMsg(
        `Đăng ký hồ sơ quán "${ownerForm.restaurantName}" thành công! Vui lòng chờ Ban Quản Trị phê duyệt kích hoạt tài khoản trước khi đăng nhập.`
      );
      setTimeout(() => {
        setOwnerSubTab('login');
        setOwnerLoginGmail(ownerForm.email);
        setOwnerLoginPassword('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Lỗi gửi hồ sơ mở quán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E7E2D7] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header với tông màu đẹp */}
        <div className="bg-gradient-to-r from-[#D9452B] via-[#E05A3F] to-[#0066CC] p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-200">
              Hệ thống Du lịch Ea Súp
            </span>
          </div>

          <h3 className="font-serif text-xl font-bold text-white">
            {mode === 'login' ? 'Đăng Nhập' : 'Chủ Quán Ăn/Uống (Gmail & Mật Khẩu)'}
          </h3>
          <p className="text-xs text-white/90 mt-1">
            {mode === 'login'
              ? 'Đăng nhập Google để đặt món, kết nối bàn ăn và khám phá ẩm thực đại ngàn.'
              : 'Đăng nhập Không Gian Quán bằng tài khoản Gmail và Mật khẩu của bạn.'}
          </p>
        </div>

        {/* Tab chuyển đổi chế độ */}
        <div className="grid grid-cols-2 p-1.5 bg-[#FBF9F5] border-b border-[#E7E2D7] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-[#0066CC] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Khách</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register_owner')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register_owner'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Chủ Quán Ăn/Uống</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* TAB 1: ĐĂNG NHẬP KHÁCH DU LỊCH BẰNG GOOGLE (GMAIL) */
            <div className="space-y-4 pt-1">
              <div className="text-center pb-1">
                <p className="text-xs text-stone-600">
                  Đăng nhập nhanh bằng tài khoản Google để đặt món, kết nối bàn ăn và khám phá ẩm thực Ea Súp.
                </p>
              </div>

              {/* Nút Đăng nhập Google (Gmail) được đưa lên trên cùng */}
              <div className="pt-1">
                <GoogleSignInButton
                  text="Đăng Nhập Bằng Google (Gmail)"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      setError('');
                      await nextAuthSignIn('google', {
                        callbackUrl: typeof window !== 'undefined' ? window.location.href : '/',
                      });
                    } catch (err: any) {
                      console.warn('Google OAuth flow fallback to Gmail prompt:', err);
                      const inputEmail = prompt(
                        'Vui lòng nhập địa chỉ Gmail của bạn để đăng nhập nhanh:',
                        'zipzenhanh@gmail.com'
                      );
                      if (inputEmail && inputEmail.includes('@')) {
                        handleGoogleAuth(
                          inputEmail.trim(),
                          inputEmail.split('@')[0],
                          'TRAVELER'
                        );
                      }
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-stone-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider shrink-0 font-medium">
                  Hoặc trải nghiệm nhanh
                </span>
                <div className="border-t border-stone-200 w-full"></div>
              </div>

              {/* Nút Đăng nhập nhanh 1 chạm */}
              <button
                type="button"
                id="btn-fast-guest-login"
                disabled={loading}
                onClick={() =>
                  handleGoogleAuth('khach.dulich@gmail.com', 'Du Khách Ea Súp', 'TRAVELER')
                }
                className="w-full py-2.5 px-3 bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <span>⚡ Đăng nhập thử nghiệm 1 chạm (Khách du lịch)</span>
              </button>

              <div className="pt-1 text-center">
                <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tài khoản khách được tự động kích hoạt ngay không cần phê duyệt.</span>
                </p>
              </div>
            </div>
          ) : (
            /* TAB 2: CHỦ QUÁN ĂN - CHỈ ĐĂNG NHẬP BẰNG GMAIL VÀ MẬT KHẨU */
            <div className="space-y-4">
              {/* Thông báo quy định dành cho Chủ Quán */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[#D9452B]">
                  <Store className="w-4 h-4 text-[#D9452B]" />
                  <span>Quy định dành cho Chủ Quán:</span>
                </p>
                <ul className="text-[11px] list-disc list-inside space-y-0.5 text-stone-700">
                  <li>Chủ quán đăng nhập bằng <strong>Gmail và Mật khẩu</strong> của quán.</li>
                  <li>Khi đăng ký quán mới: cần <strong>Ban Quản Trị phê duyệt</strong> để kích hoạt.</li>
                  <li>Khi đã được duyệt: đăng nhập sẽ <strong>chuyển thẳng vào giao diện quán của bạn</strong>.</li>
                </ul>
              </div>

              {ownerSubTab === 'login' ? (
                /* PHẦN 1: ĐĂNG NHẬP CHỦ QUÁN BẰNG GMAIL & MẬT KHẨU */
                <form onSubmit={handleOwnerPasswordLogin} className="space-y-3.5">
                  <div className="text-center">
                    <p className="text-xs text-stone-600">
                      Nhập tài khoản Gmail và Mật khẩu để vào Không Gian Quán của bạn.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>Tài khoản Gmail Chủ Quán *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tranhuongzip@gmail.com"
                      value={ownerLoginGmail}
                      onChange={(e) => setOwnerLoginGmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Mật khẩu quán *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập mật khẩu..."
                        value={ownerLoginPassword}
                        onChange={(e) => setOwnerLoginPassword(e.target.value)}
                        className="w-full text-xs p-3 pr-10 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !ownerLoginGmail || !ownerLoginPassword}
                    className="w-full py-3 px-4 bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#D9452B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Store className="w-4 h-4" />
                    <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập Không Gian Quán'}</span>
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setOwnerSubTab('register')}
                      className="text-xs text-[#D9452B] hover:underline font-semibold"
                    >
                      Chưa có hồ sơ quán trên hệ thống? 👉 Đăng ký mở quán mới
                    </button>
                  </div>
                </form>
              ) : (
                /* PHẦN 2: ĐĂNG KÝ MỞ QUÁN MỚI (GMAIL & MẬT KHẨU) */
                <form onSubmit={handleSubmitOwnerRegister} className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
                    <p className="text-xs font-bold text-[#D9452B] flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>Hồ sơ đăng ký mở quán mới</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setOwnerSubTab('login')}
                      className="text-[11px] text-stone-500 hover:text-[#D9452B] font-medium"
                    >
                      ← Quay lại Đăng nhập
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#D9452B]" />
                      <span>Tên Quán Ăn/Uống & Giải Khát *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Cà Phê Nhà Sàn hoặc Gà Nướng Cơm Lam Bản Đôn"
                      value={ownerForm.restaurantName}
                      onChange={(e) => setOwnerForm({ ...ownerForm, restaurantName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>Họ tên chủ quán *</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="VD: Trần Thị Hương"
                        value={ownerForm.name}
                        onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>Số điện thoại *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="09xx xxx xxx"
                        value={ownerForm.phone}
                        onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400" />
                      <span>Tài khoản Gmail đăng ký *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="chuquan@gmail.com"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Mật khẩu khởi tạo * (tối thiểu 6 ký tự)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        required
                        placeholder="Tối thiểu 6 ký tự..."
                        value={ownerRegisterPassword}
                        onChange={(e) => setOwnerRegisterPassword(e.target.value)}
                        className="w-full text-xs p-2.5 pr-9 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Nhập lại mật khẩu *</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Nhập lại chính xác mật khẩu trên..."
                        value={ownerRegisterConfirmPassword}
                        onChange={(e) => setOwnerRegisterConfirmPassword(e.target.value)}
                        className="w-full text-xs p-2.5 pr-9 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                        aria-label={showRegisterConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Địa chỉ quán & Tọa độ bản đồ */}
                  <div className="space-y-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D9452B]" />
                        <span>Địa chỉ quán ăn/uống tại Ea Súp</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Thôn/Buôn, Xã Ea Súp, Tỉnh Đắk Lắk"
                        value={ownerForm.restaurantAddress}
                        onChange={(e) => setOwnerForm({ ...ownerForm, restaurantAddress: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D9452B] bg-white"
                      />
                    </div>

                    {/* Tọa độ bản đồ (Lat, Lng) */}
                    <div className="pt-1 border-t border-stone-200/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1">
                          <Navigation className="w-3 h-3 text-[#0066CC]" />
                          <span>Tọa độ bản đồ du lịch (GPS)</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined' && 'geolocation' in navigator) {
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    setOwnerForm((prev) => ({
                                      ...prev,
                                      restaurantLat: Number(pos.coords.latitude.toFixed(6)),
                                      restaurantLng: Number(pos.coords.longitude.toFixed(6)),
                                    }));
                                  },
                                  () => {
                                    alert('Không thể lấy vị trí hiện tại. Giữ tọa độ mặc định Ea Súp.');
                                  }
                                );
                              }
                            }}
                            className="text-[10px] text-[#0066CC] hover:underline font-semibold"
                          >
                            📍 Lấy GPS
                          </button>
                          <span className="text-stone-300">|</span>
                          <button
                            type="button"
                            onClick={() =>
                              setOwnerForm((prev) => ({
                                ...prev,
                                restaurantLat: 13.2456,
                                restaurantLng: 107.8381,
                              }))
                            }
                            className="text-[10px] text-stone-500 hover:underline"
                          >
                            Mặc định
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-0.5">Vĩ độ (Lat)</label>
                          <input
                            type="number"
                            step="any"
                            value={ownerForm.restaurantLat}
                            onChange={(e) =>
                              setOwnerForm({ ...ownerForm, restaurantLat: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="13.2456"
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-stone-500 block mb-0.5">Kinh độ (Lng)</label>
                          <input
                            type="number"
                            step="any"
                            value={ownerForm.restaurantLng}
                            onChange={(e) =>
                              setOwnerForm({ ...ownerForm, restaurantLng: parseFloat(e.target.value) || 0 })
                            }
                            placeholder="107.8381"
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold rounded-2xl shadow-md shadow-[#D9452B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Store className="w-4 h-4" />
                    <span>{loading ? 'Đang gửi hồ sơ...' : 'Đăng Ký Quán (Gửi Admin Phê Duyệt)'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setOwnerSubTab('login')}
                      className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                    >
                      Đã có tài khoản quán? 👉 Đăng nhập bằng Gmail & Mật khẩu
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
