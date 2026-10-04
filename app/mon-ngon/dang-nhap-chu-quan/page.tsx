'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  LogIn,
  ArrowLeft,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { loginOwnerAction } from '@/actions/auth-actions';
import { toast } from 'sonner';

export default function DangNhapChuQuanPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email chủ quán.');
      return;
    }

    setLoading(true);
    setPendingMessage(null);
    try {
      const res = await loginOwnerAction(email);
      if (res.success) {
        toast.success(res.message || 'Đăng nhập thành công!');
        router.push('/chu-quan/dashboard');
      } else if (res.pending) {
        setPendingMessage(res.message);
        toast.warning(res.message);
      } else {
        toast.error(res.message || 'Đăng nhập thất bại.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kết nối máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Nút quay lại */}
        <div className="mb-4">
          <Link
            href="/mon-ngon"
            className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#D9452B] transition-colors bg-white px-3 py-1.5 rounded-xl border border-[#E7E2D7] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại Món Ngon Ea Súp</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-[#E7E2D7] p-8 shadow-heritage space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FDEDE8] text-[#D9452B] flex items-center justify-center font-bold mx-auto shadow-inner">
              <Store className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
              Đăng Nhập Chủ Quán Ăn
            </h1>
            <p className="text-xs text-stone-500">
              Khu vực dành riêng cho các quán ăn, nhà hàng đặc sản trên địa bàn xã Ea Súp
            </p>
          </div>

          {/* CẢNH BÁO NẾU TÀI KHOẢN ĐANG PENDING */}
          {pendingMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <Clock className="w-4 h-4 shrink-0 text-amber-600 animate-spin" />
                <span>{pendingMessage}</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Hồ sơ quán ăn của bạn đã được tiếp nhận và đang trong quá trình xác thực thực tế bởi Ban Quản Trị Hệ Thống.
                Khi được phê duyệt (ACTIVE), bạn sẽ có toàn quyền truy cập Dashboard.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                Email / Tài khoản Google đã đăng ký
              </label>
              <input
                type="email"
                required
                placeholder="VD: chuquan.easup@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] focus:ring-2 focus:ring-[#D9452B]/10 font-mono transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold transition-all shadow-md shadow-[#D9452B]/30 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>Vào Dashboard Không Gian Chủ Quán</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7E2D7] text-center space-y-3">
            <p className="text-xs text-stone-500">
              Chưa đăng ký thông tin quán ăn?{' '}
              <Link
                href="/mon-ngon/dang-ky-chu-quan"
                className="text-[#D9452B] font-bold hover:underline"
              >
                Đăng ký mở quán mới
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
