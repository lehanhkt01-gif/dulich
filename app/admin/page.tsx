'use client';

import React, { useState, useEffect } from 'react';
import { Destination, Category } from '@/lib/types';
import GpsPickerModal from '@/components/GpsPickerModal';
import {
  ShieldCheck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Pin,
  MapPin,
  Upload,
  Headphones,
  CheckCircle,
  AlertCircle,
  FileText,
  Sparkles,
  Compass,
  ArrowLeft,
  Users,
  UserPlus,
  LogOut,
  KeyRound,
  Shield,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'users'>('list');
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('admin@easup.daklak.gov.vn');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subTitle: '',
    historicalPeriod: '',
    content: '',
    audioVoiceUrl: '',
    thumbnail: '',
    address: 'Xã Ea Súp, Tỉnh Đắk Lắk',
    latitude: 13.070029,
    longitude: 107.883355,
    bestSeason: 'Tháng 11 đến Tháng 4 mùa khô rực rỡ',
    entryFee: 'Miễn phí tham quan',
    visitingHours: '07:00 - 17:30',
    culturalNotes: '',
    categoryId: 'cat-di-tich',
    isFeatured: false,
  });

  const [gpsModalOpen, setGpsModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tải danh sách destinations & categories
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/destinations');
      const data = await res.json();
      if (data.success) {
        setDestinations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra phiên đăng nhập
  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('admin_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthChecking(false);
    }
  };

  // Đăng nhập hệ thống
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      } else {
        setLoginError(data.message || 'Email hoặc mật khẩu không chính xác');
      }
    } catch (err: any) {
      setLoginError('Lỗi kết nối máy chủ: ' + err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Đăng xuất hệ thống
  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    setCurrentUser(null);
  };

  // Tải danh sách người dùng (cán bộ)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cấp tài khoản cán bộ mới
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserMsg(null);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (data.success) {
        setUserMsg({ type: 'success', text: data.message });
        setNewUser({ name: '', email: '', password: '', role: 'EDITOR' });
        fetchUsers();
      } else {
        setUserMsg({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setUserMsg({ type: 'error', text: 'Lỗi: ' + err.message });
    } finally {
      setCreatingUser(false);
    }
  };

  // Xóa tài khoản cán bộ
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi quyền và xóa tài khoản của cán bộ "${userName}" không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUserMsg({ type: 'success', text: data.message });
        fetchUsers();
      } else {
        setUserMsg({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setUserMsg({ type: 'error', text: 'Lỗi khi xóa: ' + err.message });
    }
  };

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Tự động tạo slug từ tiêu đề
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setFormData((prev) => ({ ...prev, title: val, slug: prev.slug || slug }));
  };

  // Upload hình ảnh (tự động nén WebP)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, thumbnail: result.url }));
        setStatusMessage({ type: 'success', text: 'Tải ảnh & nén WebP thành công!' });
      } else {
        setStatusMessage({ type: 'error', text: result.message || 'Lỗi khi upload ảnh' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Không thể tải ảnh lên máy chủ' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Upload file âm thanh thuyết minh
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    try {
      const data = new FormData();
      data.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, audioVoiceUrl: result.url }));
        setStatusMessage({ type: 'success', text: 'Tải file âm thanh thuyết minh thành công!' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Không thể tải file âm thanh' });
    } finally {
      setUploadingAudio(false);
    }
  };

  // Toggle Featured (Ghim trang chủ)
  const toggleFeatured = async (dest: Destination) => {
    try {
      const res = await fetch(`/api/destinations/${dest.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !dest.isFeatured }),
      });
      if (res.ok) {
        setDestinations(
          destinations.map((d) => (d.id === dest.id ? { ...d, isFeatured: !d.isFeatured } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Published
  const togglePublished = async (dest: Destination) => {
    try {
      const res = await fetch(`/api/destinations/${dest.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !dest.isPublished }),
      });
      if (res.ok) {
        setDestinations(
          destinations.map((d) => (d.id === dest.id ? { ...d, isPublished: !d.isPublished } : d))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa destination
  const handleDelete = async (slug: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa điểm đến di tích này?')) return;

    try {
      const res = await fetch(`/api/destinations/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        setDestinations(destinations.filter((d) => d.slug !== slug));
        setStatusMessage({ type: 'success', text: 'Đã xóa điểm đến thành công' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi khi xóa điểm đến' });
    }
  };

  // Lưu mới hoặc Cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      setStatusMessage({ type: 'error', text: 'Vui lòng điền đủ Tiêu đề, Slug và Bài thuyết minh' });
      return;
    }

    try {
      if (editingDest) {
        // Cập nhật
        const res = await fetch(`/api/destinations/${editingDest.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          setStatusMessage({ type: 'success', text: 'Cập nhật thành công!' });
          setEditingDest(null);
          setActiveTab('list');
          fetchData();
        }
      } else {
        // Thêm mới
        const res = await fetch('/api/destinations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (result.success) {
          setStatusMessage({ type: 'success', text: 'Thêm điểm đến mới thành công!' });
          setActiveTab('list');
          fetchData();
        }
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Lỗi hệ thống khi lưu' });
    }
  };

  const startEdit = (dest: Destination) => {
    setEditingDest(dest);
    setFormData({
      title: dest.title,
      slug: dest.slug,
      subTitle: dest.subTitle || '',
      historicalPeriod: dest.historicalPeriod || '',
      content: dest.content,
      audioVoiceUrl: dest.audioVoiceUrl || '',
      thumbnail: dest.thumbnail,
      address: dest.address,
      latitude: dest.latitude,
      longitude: dest.longitude,
      bestSeason: dest.bestSeason || '',
      entryFee: dest.entryFee || '',
      visitingHours: dest.visitingHours || '',
      culturalNotes: dest.culturalNotes || '',
      categoryId: dest.categoryId,
      isFeatured: dest.isFeatured,
    });
    setActiveTab('create');
  };

  const filtered = destinations.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authChecking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0066CC] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-stone-500 font-mono">Đang kiểm tra bảo mật...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7E2D7] shadow-heritage p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0066CC] shadow-md mx-auto bg-white p-1">
              <img src="/logo-easup-official.png" alt="Logo Ea Súp" className="w-full h-full object-cover rounded-full" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Cổng Quản Trị Hệ Thống</h2>
            <p className="text-xs text-[#0066CC] font-bold uppercase tracking-wider">
              Đoàn Thanh Niên Ea Súp - Đắk Lắk
            </p>
            <p className="text-xs text-stone-500">
              Vui lòng đăng nhập bằng tài khoản Quản trị viên hoặc Cán bộ biên tập
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Email Cán Bộ / Quản Trị</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@easup.daklak.gov.vn"
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC] bg-[#FBF9F5]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Mật Khẩu Đăng Nhập</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC] bg-[#FBF9F5]"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị Viên</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7E2D7] text-center space-y-2">
            <p className="text-[11px] text-stone-500">
              Tài khoản quản trị mặc định:
            </p>
            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-left font-mono text-[11px] text-stone-700 space-y-1">
              <div>Email: <strong className="text-[#0066CC]">admin@easup.daklak.gov.vn</strong></div>
              <div>Mật khẩu: <strong className="text-emerald-700">AdminEaSup@2025!</strong></div>
            </div>
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#0066CC] pt-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E2D7] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src="/logo-doan-thanh-nien.png"
              alt="Huy hiệu Đoàn Thanh Niên"
              className="w-7 h-7 object-contain shrink-0 drop-shadow-sm"
            />
            <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">
              ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK (XÃ EA SÚP)
            </span>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-600 font-medium">Cán bộ: <strong>{currentUser.name}</strong></span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-blue-100 text-blue-900 border border-blue-300'
                }`}
              >
                {currentUser.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'BIÊN TẬP VIÊN'}
              </span>
            </div>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Quản Trị Hệ Thống: DU LỊCH EA SÚP
          </h1>
          <p className="text-xs text-[#A64B2A] font-bold uppercase tracking-wider mt-1">
            BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E7E2D7] text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang Chủ</span>
          </Link>

          <button
            onClick={() => {
              setEditingDest(null);
              setActiveTab('list');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'list'
                ? 'bg-[#0066CC] text-white'
                : 'bg-white border border-[#E7E2D7] text-stone-700 hover:bg-stone-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Danh Sách Di Tích</span>
          </button>

          <button
            onClick={() => {
              setEditingDest(null);
              setActiveTab('create');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'create'
                ? 'bg-[#0066CC] text-white'
                : 'bg-white border border-[#E7E2D7] text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mới Danh Thắng</span>
          </button>

          {/* Tab Phân quyền cán bộ (Users) */}
          <button
            onClick={() => {
              setActiveTab('users');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'users'
                ? 'bg-[#0066CC] text-white'
                : 'bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100'
            }`}
            title="Cấp quyền quản lý cho cán bộ khác"
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Phân Quyền Cán Bộ</span>
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
          <p className="text-xs text-stone-500 font-medium">Tổng danh lam & di tích</p>
          <p className="text-2xl font-serif font-bold text-[#0066CC] mt-1">{destinations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
          <p className="text-xs text-stone-500 font-medium">Ghim tiêu biểu trang chủ</p>
          <p className="text-2xl font-serif font-bold text-[#A64B2A] mt-1">
            {destinations.filter((d) => d.isFeatured).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
          <p className="text-xs text-stone-500 font-medium">Thuyết minh audio số</p>
          <p className="text-2xl font-serif font-bold text-[#1C1917] mt-1">
            {destinations.filter((d) => d.audioVoiceUrl).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
          <p className="text-xs text-stone-500 font-medium">Tổng lượt quan tâm</p>
          <p className="text-2xl font-serif font-bold text-[#0066CC] mt-1">
            {destinations.reduce((acc, d) => acc + (d.viewsCount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Thông báo Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline">
            Đóng
          </button>
        </div>
      )}

      {/* TAB 1: DANH SÁCH QUẢN LÝ */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên di tích, thôn buôn, địa chỉ..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#1C1917]">
              <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Di tích / Danh lam</th>
                  <th className="py-3 px-4">Địa bàn thôn/buôn</th>
                  <th className="py-3 px-4">Tọa độ GPS</th>
                  <th className="py-3 px-4 text-center">Ghim Trang Chủ</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E2D7]">
                {filtered.map((dest) => (
                  <tr key={dest.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={dest.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover border border-[#E7E2D7]"
                        />
                        <div>
                          <p className="font-bold text-[#1C1917] truncate max-w-xs">{dest.title}</p>
                          <p className="text-[11px] text-stone-500 font-mono">/{dest.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate">{dest.address}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500">
                      {dest.latitude.toFixed(4)}, {dest.longitude.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleFeatured(dest)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          dest.isFeatured
                            ? 'bg-[#A64B2A]/15 text-[#A64B2A]'
                            : 'text-stone-300 hover:text-stone-600'
                        }`}
                        title="Bật/Tắt ghim tiêu biểu"
                      >
                        <Pin className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => togglePublished(dest)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          dest.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {dest.isPublished ? 'Đang Hiện' : 'Ẩn'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/destinations/${dest.slug}`}
                          target="_blank"
                          className="p-1.5 text-stone-500 hover:text-[#0066CC]"
                          title="Xem trên web"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => startEdit(dest)}
                          className="p-1.5 text-stone-500 hover:text-amber-700"
                          title="Sửa nội dung"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(dest.slug)}
                          className="p-1.5 text-stone-500 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FORM THÊM MỚI / CHỈNH SỬA TRỰC QUAN */}
      {activeTab === 'create' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 sm:p-8 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#E7E2D7] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0066CC]" />
              <span>{editingDest ? 'Chỉnh Sửa Hồ Sơ Di Tích' : 'Tạo Mới Hồ Sơ Di Tích & Danh Thắng'}</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Hủy bỏ & quay lại
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên danh lam */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Tên Danh Thắng / Di Tích *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="VD: Tháp Chàm Yang PRông, Hồ Ea Súp Thượng..."
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
              />
            </div>

            {/* Slug URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Đường dẫn thân thiện (Slug) *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="thap-cham-yang-prong"
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] font-mono focus:outline-none focus:border-[#0066CC]"
              />
            </div>

            {/* Danh mục */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Chuyên đề di sản</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC] bg-white"
              >
                <option value="cat-di-tich">Di tích Lịch sử & Kiến trúc</option>
                <option value="cat-thac-ho">Thác nước & Hồ cảnh quan</option>
                <option value="cat-buon-lang">Không gian Văn hóa Buôn làng</option>
                <option value="cat-sinh-thai">Du lịch Sinh thái & Nông nghiệp</option>
              </select>
            </div>

            {/* Niên đại lịch sử */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Niên Đại / Thời Kỳ Lịch Sử</label>
              <input
                type="text"
                value={formData.historicalPeriod}
                onChange={(e) => setFormData({ ...formData, historicalPeriod: e.target.value })}
                placeholder="VD: Cuối thế kỷ XIII, Thời vua Chế Mân..."
                className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
              />
            </div>
          </div>

          {/* Tiêu đề phụ */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">Tiêu Đề Dẫn Ý (Sub-title)</label>
            <input
              type="text"
              value={formData.subTitle}
              onChange={(e) => setFormData({ ...formData, subTitle: e.target.value })}
              placeholder="Một câu trích dẫn đặc sắc về di tích..."
              className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          {/* ĐỊA CHỈ & CHẤM TỌA ĐỘ GPS BẰNG BẢN ĐỒ */}
          <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#E7E2D7] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#A64B2A]" />
                Địa Bàn Hành Chính & Tọa Độ Địa Chính (GPS GIS)
              </span>
              <button
                type="button"
                onClick={() => setGpsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066CC] text-white text-xs font-semibold hover:bg-[#0052A3] shadow-sm"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Chấm Tọa Độ Trên Bản Đồ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="text-[11px] text-stone-500 font-medium">Thôn/Buôn, Xã</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7] bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-500 font-medium">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7] font-mono bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-stone-500 font-medium">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7] font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* TẢI ẢNH CHẤT LƯỢNG CAO & FILE ÂM THANH THUYẾT MINH */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ảnh đại diện với kéo thả & nén WebP */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Ảnh Tiêu Biểu (Tự động nén WebP)</span>
                {uploadingImage && <span className="text-[11px] text-[#0066CC]">Đang nén WebP...</span>}
              </label>
              <div className="border-2 border-dashed border-[#E7E2D7] hover:border-[#0066CC] rounded-xl p-4 text-center bg-[#FBF9F5] transition-colors relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1" />
                <p className="text-xs text-stone-600 font-medium">
                  Kéo thả ảnh hoặc bấm để chọn từ máy tính
                </p>
                <p className="text-[10px] text-stone-400 mt-1 font-mono">
                  {formData.thumbnail ? formData.thumbnail : 'Chưa có ảnh'}
                </p>
              </div>
            </div>

            {/* File âm thanh thuyết minh AI */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>File Âm Thanh Thuyết Minh AI (.mp3, .ogg)</span>
                {uploadingAudio && <span className="text-[11px] text-[#0066CC]">Đang tải lên...</span>}
              </label>
              <div className="border-2 border-dashed border-[#E7E2D7] hover:border-[#0066CC] rounded-xl p-4 text-center bg-[#FBF9F5] transition-colors relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Headphones className="w-6 h-6 text-[#0066CC] mx-auto mb-1" />
                <p className="text-xs text-stone-600 font-medium">
                  Kéo thả file thuyết minh ghi âm
                </p>
                <p className="text-[10px] text-stone-400 mt-1 font-mono truncate">
                  {formData.audioVoiceUrl || 'Chưa gắn file âm thanh'}
                </p>
              </div>
            </div>
          </div>

          {/* BÀI VIẾT THUYẾT MINH CHUYÊN SÂU */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700">
              Bài Viết Thuyết Minh & Khảo Cứu Lịch Sử (Nội dung chi tiết) *
            </label>
            <textarea
              required
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Soạn thảo nội dung lịch sử, kiến trúc, sự tích, tín ngưỡng..."
              className="w-full text-xs p-3 rounded-xl border border-[#E7E2D7] leading-relaxed focus:outline-none focus:border-[#0066CC]"
            />
          </div>

          {/* SỔ TAY DU KHÁCH & LƯU Ý PHONG TỤC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] text-stone-600 font-bold">Mùa Tham Quan Đẹp Nhất</label>
              <input
                type="text"
                value={formData.bestSeason}
                onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7]"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-600 font-bold">Giá Vé Tham Quan</label>
              <input
                type="text"
                value={formData.entryFee}
                onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7]"
              />
            </div>
            <div>
              <label className="text-[11px] text-stone-600 font-bold">Giờ Đón Khách</label>
              <input
                type="text"
                value={formData.visitingHours}
                onChange={(e) => setFormData({ ...formData, visitingHours: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-[#E7E2D7]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#A64B2A]">
              Lưu Ý Phong Tục Bản Địa & Điều Kiêng Kỵ Của Người Êđê / Gia Rai
            </label>
            <textarea
              rows={3}
              value={formData.culturalNotes}
              onChange={(e) => setFormData({ ...formData, culturalNotes: e.target.value })}
              placeholder="VD: Không tự ý sờ cồng chiêng, cầu thang cái có hình bầu sữa mẹ..."
              className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7]"
            />
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 rounded text-[#0066CC] focus:ring-0"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-stone-700 cursor-pointer">
              Ghim danh thắng này làm Di Sản Tiêu Biểu trên Bento Grid trang chủ
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E2D7]">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold shadow-md transition-all"
            >
              {editingDest ? 'Lưu Thay Đổi Di Tích' : 'Đăng Tải Danh Thắng Mới'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: QUẢN LÝ CÁN BỘ & PHÂN QUYỀN TRUY CẬP */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Header & Hướng dẫn phân quyền */}
          <div className="bg-gradient-to-r from-blue-900 to-[#0066CC] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>Bảo Mật & Phân Quyền Hệ Thống</span>
              </div>
              <h2 className="text-xl font-bold font-serif">Quản Lý Danh Sách Cán Bộ & Cấp Quyền Truy Cập</h2>
              <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                Tại đây, quản trị viên có thể cấp tài khoản cho các cán bộ phụ trách Văn hóa - Thông tin hoặc Đoàn thanh niên để cùng đăng nhập, biên tập nội dung di tích và thuyết minh số.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
              <KeyRound className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="font-bold text-white">Vai trò quản trị</p>
                <p className="text-[11px] text-blue-100">ADMIN: Toàn quyền | EDITOR: Biên tập di tích</p>
              </div>
            </div>
          </div>

          {/* User Message Notification */}
          {userMsg && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
                userMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {userMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{userMsg.text}</span>
              </div>
              <button onClick={() => setUserMsg(null)} className="text-xs underline hover:no-underline">
                Đóng
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CỘT TRÁI: FORM CẤP TÀI KHOẢN MỚI */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E7E2D7]">
                <UserPlus className="w-5 h-5 text-[#0066CC]" />
                <h3 className="font-bold text-[#1C1917] text-sm">Cấp Tài Khoản Cán Bộ Mới</h3>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Họ và tên cán bộ *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn A"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Email đăng nhập *</label>
                  <input
                    type="email"
                    required
                    placeholder="canbo@easup.daklak.gov.vn"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Mật khẩu khởi tạo *</label>
                  <input
                    type="password"
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
                  />
                  <p className="text-[10px] text-stone-400">Cán bộ có thể dùng email và mật khẩu này để đăng nhập.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Cấp phân quyền *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] bg-white focus:outline-none focus:border-[#0066CC]"
                  >
                    <option value="EDITOR">Biên Tập Viên (EDITOR) - Đăng & sửa di tích</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN) - Toàn quyền hệ thống</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full mt-2 py-2.5 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creatingUser ? 'Đang tạo tài khoản...' : 'Cấp Quyền & Tạo Tài Khoản'}</span>
                </button>
              </form>
            </div>

            {/* CỘT PHẢI: BẢNG DANH SÁCH CÁN BỘ ĐÃ CẤP */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D7]">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0066CC]" />
                  <h3 className="font-bold text-[#1C1917] text-sm">Danh Sách Cán Bộ Có Quyền Quản Trị</h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {users.length} tài khoản đang hoạt động
                </span>
              </div>

              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-stone-500">Đang tải danh sách tài khoản...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1C1917]">
                    <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Cán bộ</th>
                        <th className="py-3 px-4">Email đăng nhập</th>
                        <th className="py-3 px-4 text-center">Vai trò</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2D7]">
                      {users.map((u) => {
                        const isSelf = currentUser?.email === u.email;
                        const isSuperAdmin = u.email === 'admin@easup.daklak.gov.vn';
                        return (
                          <tr key={u.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0066CC] font-bold flex items-center justify-center text-xs">
                                  {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-bold text-[#1C1917] flex items-center gap-1.5">
                                    <span>{u.name}</span>
                                    {isSelf && (
                                      <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-normal">
                                        (Bạn)
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-stone-400">ID: {u.id.substring(0, 10)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">{u.email}</td>
                            <td className="py-3.5 px-4 text-center">
                              {u.role === 'ADMIN' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#0066CC] border border-blue-200">
                                  <Shield className="w-3 h-3" />
                                  ADMIN
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Edit className="w-3 h-3" />
                                  EDITOR
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {isSuperAdmin ? (
                                <span className="text-[11px] text-stone-400 italic">Mặc định</span>
                              ) : isSelf ? (
                                <span className="text-[11px] text-stone-400 italic">Đang đăng nhập</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition-colors"
                                  title="Thu hồi quyền và xóa tài khoản"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Thu hồi quyền</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {gpsModalOpen && (
        <GpsPickerModal
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onSelect={(lat, lng) => {
            setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
          }}
          onClose={() => setGpsModalOpen(false)}
        />
      )}
    </div>
  );
}
