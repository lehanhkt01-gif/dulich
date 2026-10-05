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
  UtensilsCrossed,
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  approveOwnerAction,
  rejectOwnerAction,
  updateUserRoleStatusAction,
  deleteUserAction,
  getAdminDashboardDataAction,
  resetOwnerPasswordAction,
} from '@/actions/admin-actions';
import { computeCounts, type AdminCounts } from '@/lib/account-sync';

export type AdminTab = 'list' | 'create' | 'food-tables' | 'customers' | 'owners' | 'cadres' | 'users';

export default function AdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('list');
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [adminCounts, setAdminCounts] = useState<AdminCounts | null>(null);
  // Số liệu dùng chung: ưu tiên bộ đếm từ máy chủ, dự phòng tính từ dữ liệu đang hiển thị
  const counts = adminCounts || computeCounts(users, restaurants);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Food Tables Management State
  const [foodTables, setFoodTables] = useState<any[]>([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [tableMsg, setTableMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    localStorage.removeItem('admin_user');
    localStorage.removeItem('easup_auth_user');
    sessionStorage.clear();
    setCurrentUser(null);
    window.location.href = '/';
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

  // Thay đổi vai trò người dùng (Phân quyền Admin)
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUserMsg({ type: 'success', text: data.message });
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        setUserMsg({ type: 'error', text: data.message || 'Lỗi cập nhật vai trò' });
      }
    } catch (err: any) {
      setUserMsg({ type: 'error', text: 'Lỗi: ' + err.message });
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

  // Tải danh sách bàn ăn & ẩm thực
  const fetchFoodTables = async () => {
    try {
      setLoadingTables(true);
      const res = await fetch('/api/food-tables?includeCancelled=true');
      const data = await res.json();
      if (data.success) {
        setFoodTables(data.data);
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách bàn ăn:', err);
    } finally {
      setLoadingTables(false);
    }
  };

  // Xóa bàn ăn
  const handleDeleteTable = async (tableId: string, restaurant: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bàn ăn tại "${restaurant}" không?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/food-tables/${tableId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTableMsg({ type: 'success', text: 'Đã xóa bàn ăn thành công' });
        fetchFoodTables();
      } else {
        setTableMsg({ type: 'error', text: data.message || 'Lỗi khi xóa bàn ăn' });
      }
    } catch (err: any) {
      setTableMsg({ type: 'error', text: 'Lỗi khi xóa: ' + err.message });
    }
  };

  // Tải dữ liệu toàn diện: Users, Restaurants, Pending Approvals
  const fetchAllAdminData = async () => {
    try {
      setLoadingUsers(true);
      const res = await getAdminDashboardDataAction();
      if (res.success) {
        setUsers(res.users || []);
        setRestaurants(res.restaurants || []);
        setPendingApprovals(res.pendingApprovals || []);
        setAdminCounts((res as any).counts || null);
      }
    } catch {
      fetchUsers();
    } finally {
      setLoadingUsers(false);
    }
  };

  // Phê duyệt chủ quán
  const handleApproveOwner = async (userId: string, restaurantId: string, restaurantName: string) => {
    try {
      const res = await approveOwnerAction(userId, restaurantId);
      if (res.success) {
        toast.success(res.message);
        fetchAllAdminData();
      } else {
        toast.error('Phê duyệt thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi duyệt: ' + err.message);
    }
  };

  // Từ chối chủ quán
  const handleRejectOwner = async (userId: string, restaurantId: string, restaurantName: string) => {
    if (!confirm(`Bạn có chắc muốn từ chối hồ sơ quán "${restaurantName}"?`)) return;
    try {
      const res = await rejectOwnerAction(userId, restaurantId);
      if (res.success) {
        toast.success(res.message);
        fetchAllAdminData();
      } else {
        toast.error('Từ chối thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi từ chối: ' + err.message);
    }
  };

  // Reset mật khẩu ngẫu nhiên 8 ký tự cho chủ quán và gửi email
  const handleResetOwnerPassword = async (
    userId: string,
    ownerName: string,
    ownerEmail: string,
    restaurantName: string
  ) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn RESET MẬT KHẨU cho chủ quán "${ownerName}" của quán "${restaurantName}"?\n\n• Email nhận mật khẩu: ${ownerEmail}\n• Hệ thống sẽ tự động tạo mật khẩu ngẫu nhiên 8 ký tự và gửi email trực tiếp cho chủ quán.`
      )
    ) {
      return;
    }

    try {
      toast.loading('Đang khởi tạo mật khẩu mới 8 ký tự và gửi email...', { id: 'reset-pwd' });
      const res = await resetOwnerPasswordAction(userId);
      if (res.success) {
        toast.success(res.message, { id: 'reset-pwd', duration: 7000 });
        fetchAllAdminData();
      } else {
        toast.error(res.message || 'Reset mật khẩu thất bại', { id: 'reset-pwd' });
      }
    } catch (err: any) {
      toast.error('Lỗi khi reset mật khẩu: ' + err.message, { id: 'reset-pwd' });
    }
  };

  // Khóa / Mở khóa tài khoản khách hàng hoặc chủ quán
  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    try {
      const res = await updateUserRoleStatusAction(user.id, user.role, newStatus);
      if (res.success) {
        toast.success(`Đã chuyển trạng thái tài khoản sang ${newStatus}`);
        fetchAllAdminData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  useEffect(() => {
    if (
      activeTab === 'customers' ||
      activeTab === 'owners' ||
      activeTab === 'cadres' ||
      activeTab === 'users'
    ) {
      fetchAllAdminData();
    }
    if (activeTab === 'food-tables') {
      fetchFoodTables();
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

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-stone-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] text-stone-400 uppercase tracking-wider shrink-0 font-medium">
                Hoặc
              </span>
              <div className="border-t border-stone-200 w-full"></div>
            </div>

            <button
              type="button"
              disabled={loginLoading}
              onClick={async () => {
                setLoginLoading(true);
                try {
                  const res = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      googleProfile: {
                        email: 'admin@easup.daklak.gov.vn',
                        name: 'Quản Trị Viên Ea Súp',
                      },
                      roleRequest: 'ADMIN',
                    }),
                  });
                  const data = await res.json();
                  if (data.success && data.user) {
                    setCurrentUser(data.user);
                    localStorage.setItem('admin_user', JSON.stringify(data.user));
                    localStorage.setItem('easup_auth_user', JSON.stringify(data.user));
                  }
                } catch (e: any) {
                  setLoginError('Lỗi đăng nhập Google: ' + e.message);
                } finally {
                  setLoginLoading(false);
                }
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Đăng Nhập Nhanh Bằng Tài Khoản Google Admin</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#E7E2D7] text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#0066CC]">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // CHẶN QUYỀN: Chủ Quán Ăn (OWNER) CHỈ có quyền quản lý quán, món, bàn và đơn đặt khách
  if (currentUser.role === 'OWNER') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-amber-200 shadow-heritage p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8 text-[#D9452B]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Quyền Hạn Tài Khoản Chủ Quán</h2>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 text-left space-y-2 leading-relaxed">
            <p className="font-bold text-stone-900">
              Xin chào {currentUser.name} (Chủ Quán Ăn)!
            </p>
            <p>Theo quy định phân quyền hệ thống (RBAC), tài khoản Chủ Quán <strong>chỉ có các quyền sau:</strong></p>
            <ul className="list-disc pl-4 space-y-1.5 font-medium text-amber-900">
              <li>Tạo, chỉnh sửa, xóa món ăn của quán</li>
              <li>Tạo, chỉnh sửa, xóa bàn ăn</li>
              <li>Biết thông tin họ tên & số điện thoại khách hàng</li>
              <li>Phê duyệt hoặc từ chối khách hàng đặt món & đặt bàn</li>
            </ul>
            <p className="pt-1 text-[11px] text-stone-500 italic">
              Bạn không có quyền can thiệp vào Ban Quản Trị Di Tích & Hệ Thống Địa Phương.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/chu-quan"
              className="py-3 px-5 rounded-2xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold transition-all shadow-sm"
            >
              Vào Không Gian Chủ Quán Của Bạn ➔
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
            >
              Đăng xuất tài khoản này
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CHẶN QUYỀN: Khách du lịch (USER) không được vào admin
  if (currentUser.role === 'USER' || currentUser.role === 'TRAVELER') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-heritage p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-stone-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1C1917]">Khu Vực Hạn Chế</h2>
          <p className="text-xs text-stone-600">
            Tài khoản của bạn là Khách du lịch. Khu vực này chỉ dành cho Ban Quản Trị và Cán bộ chuyên đề.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="py-3 px-5 rounded-2xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow-sm"
            >
              Quay Về Trang Chủ Du Lịch Ea Súp
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
            >
              Đăng xuất tài khoản
            </button>
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

          {/* Tab Món Ngon & Bàn Ăn */}
          <button
            onClick={() => {
              setActiveTab('food-tables');
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'food-tables'
                ? 'bg-[#D9452B] text-white'
                : 'bg-white border border-[#EADBD0] text-[#D9452B] hover:bg-[#FDEDE8]'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Món Ngon & Bàn Ăn</span>
          </button>

          {/* Nút 1: Khách Hàng (Tự động kích hoạt bằng Gmail) */}
          <button
            onClick={() => setActiveTab('customers')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'customers'
                ? 'bg-purple-600 text-white shadow-purple-200 ring-2 ring-purple-400'
                : 'bg-purple-50 border border-purple-200 text-purple-800 hover:bg-purple-100'
            }`}
            title="Quản lý khách du lịch (Đăng nhập Gmail, tự động kích hoạt, không cần duyệt)"
          >
            <Users className="w-4 h-4 text-purple-600" />
            <span>Khách Hàng</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'customers'
                  ? 'bg-white text-purple-700'
                  : 'bg-purple-200/80 text-purple-900'
              }`}
            >
              {counts.customers}
            </span>
          </button>

          {/* Nút 2: Chủ Quán (Đăng ký qua Gmail, Admin bắt buộc phê duyệt) */}
          <button
            onClick={() => setActiveTab('owners')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'owners'
                ? 'bg-[#D9452B] text-white shadow-red-200 ring-2 ring-red-400'
                : 'bg-orange-50 border border-orange-200 text-[#D9452B] hover:bg-orange-100'
            }`}
            title="Quản lý chủ quán ăn (Đăng nhập Gmail, Admin phê duyệt, vào thẳng quán)"
          >
            <Store className="w-4 h-4 text-[#D9452B]" />
            <span>Chủ Quán</span>
            {pendingApprovals.length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-extrabold animate-pulse">
                {pendingApprovals.length} chờ duyệt
              </span>
            ) : (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === 'owners'
                    ? 'bg-white text-[#D9452B]'
                    : 'bg-orange-200/80 text-orange-900'
                }`}
              >
                {counts.owners}
              </span>
            )}
          </button>

          {/* Nút 3: Cán Bộ (Tài khoản nội bộ quản lý hệ thống & phân quyền) */}
          <button
            onClick={() => setActiveTab('cadres')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              activeTab === 'cadres' || activeTab === 'users'
                ? 'bg-[#0066CC] text-white shadow-blue-200 ring-2 ring-blue-400'
                : 'bg-blue-50 border border-blue-200 text-[#0066CC] hover:bg-blue-100'
            }`}
            title="Cấp quyền quản lý cho cán bộ (ADMIN, CADRE, EDITOR)"
          >
            <Shield className="w-4 h-4 text-[#0066CC]" />
            <span>Cán Bộ</span>
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === 'cadres' || activeTab === 'users'
                  ? 'bg-white text-[#0066CC]'
                  : 'bg-blue-200/80 text-blue-900'
              }`}
            >
              {
                users.filter(
                  (u) => u.role === 'CADRE' || u.role === 'ADMIN' || u.role === 'EDITOR'
                ).length
              }
            </span>
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

      {/* TAB: QUẢN LÝ KHÁCH HÀNG (Google OAuth, tự động kích hoạt) */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          {/* Header Banner Khách Hàng */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Users className="w-3.5 h-3.5 text-purple-300" />
                <span>Khách Du Lịch & Du Khách Tự Do</span>
              </div>
              <h2 className="text-xl font-bold font-serif">Quản Lý Khách Hàng Đăng Nhập Gmail</h2>
              <p className="text-xs text-purple-100 max-w-2xl leading-relaxed">
                Khách hàng đăng nhập nhanh bằng Gmail (Google OAuth) và <strong>được tự động kích hoạt ngay lập tức</strong> (không cần Admin phê duyệt). Du khách có quyền khám phá danh thắng, tham gia bàn ăn và gửi đơn đặt món.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white">Chính sách kích hoạt</p>
                <p className="text-[11px] text-purple-100">Kích hoạt tức thì (ACTIVE) qua Gmail</p>
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

          {/* KPI Khách hàng */}
          {(() => {
            const customerList = users.filter((u) => u.role === 'USER' || u.role === 'TRAVELER');
            // customerList.length luôn bằng counts.customers (cùng một nguồn dữ liệu)
            const activeCount = customerList.filter((u) => u.status !== 'BLOCKED').length;
            const blockedCount = customerList.filter((u) => u.status === 'BLOCKED').length;

            return (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
                    <p className="text-xs text-stone-500 font-medium">Tổng số khách hàng</p>
                    <p className="text-2xl font-serif font-bold text-purple-700 mt-1">{customerList.length}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
                    <p className="text-xs text-stone-500 font-medium">Đang hoạt động (ACTIVE)</p>
                    <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">{activeCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
                    <p className="text-xs text-stone-500 font-medium">Tài khoản bị khóa</p>
                    <p className="text-2xl font-serif font-bold text-red-600 mt-1">{blockedCount}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
                    <p className="text-xs text-stone-500 font-medium">Hình thức đăng nhập</p>
                    <p className="text-base font-bold text-stone-800 mt-2 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      100% Gmail / Google
                    </p>
                  </div>
                </div>

                {/* Bảng danh sách Khách hàng */}
                <div className="bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D7]">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-[#1C1917] text-sm">Danh Sách Khách Hàng Đã Đăng Nhập</h3>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">{customerList.length} khách hàng</span>
                  </div>

                  {loadingUsers ? (
                    <div className="py-12 text-center text-xs text-stone-500">Đang tải danh sách khách hàng...</div>
                  ) : customerList.length === 0 ? (
                    <div className="py-12 text-center text-xs text-stone-500">
                      Chưa có khách hàng nào đăng nhập. Khách hàng khi đăng nhập bằng Google sẽ tự động hiển thị ở đây.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-[#1C1917]">
                        <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                          <tr>
                            <th className="py-3 px-4">Khách Hàng</th>
                            <th className="py-3 px-4">Email Gmail</th>
                            <th className="py-3 px-4 text-center">Trạng Thái</th>
                            <th className="py-3 px-4">Ngày Tham Gia</th>
                            <th className="py-3 px-4 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E2D7]">
                          {customerList.map((u) => {
                            const isBlocked = u.status === 'BLOCKED';
                            return (
                              <tr key={u.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                                      {u.name?.charAt(0)?.toUpperCase() || 'K'}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#1C1917]">{u.name}</p>
                                      {u.phone && <p className="text-[10px] text-stone-500">SĐT: {u.phone}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                                  <span className="inline-flex items-center gap-1">
                                    <Mail className="w-3 h-3 text-stone-400" />
                                    {u.email}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-center">
                                  {isBlocked ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                      <Lock className="w-3 h-3" /> Đã Khóa
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoạt Động (Tự Kích Hoạt)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'Mới tham gia'}
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUserStatus(u)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                        isBlocked
                                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                      }`}
                                    >
                                      {isBlocked ? 'Mở Khóa' : 'Khóa'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteUser(u.id, u.name)}
                                      className="p-1 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                      title="Xóa người dùng"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* TAB: QUẢN LÝ CHỦ QUÁN (Admin bắt buộc phê duyệt -> vào thẳng quán) */}
      {activeTab === 'owners' && (
        <div className="space-y-6">
          {/* Header Banner Chủ Quán */}
          <div className="bg-gradient-to-r from-red-900 via-[#D9452B] to-orange-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span>Hồ Sơ Nhà Hàng & Quán Ăn Địa Phương</span>
              </div>
              <h2 className="text-xl font-bold font-serif">Quản Lý & Phê Duyệt Hồ Sơ Chủ Quán</h2>
              <p className="text-xs text-orange-100 max-w-2xl leading-relaxed">
                Chủ quán đăng ký bằng Gmail. Hồ sơ ban đầu ở trạng thái <strong>Chờ phê duyệt (PENDING)</strong>. Bắt buộc Admin phê duyệt (ACTIVE) thì chủ quán mới được hoạt động. <strong>Khi đăng nhập bằng Gmail, chủ quán sẽ vào trực tiếp giao diện quản lý quán của mình</strong>.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="font-bold text-white">Yêu cầu phê duyệt</p>
                <p className="text-[11px] text-orange-100">Bắt buộc Admin duyệt trước khi mở bán</p>
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

          {/* MỤC 1: HỒ SƠ CHỦ QUÁN CHỜ DUYỆT (PENDING) */}
          <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <h3 className="font-bold text-[#1C1917] text-base flex items-center gap-2">
                  <span>Hồ Sơ Chủ Quán Chờ Phê Duyệt</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white">
                    {pendingApprovals.length} yêu cầu
                  </span>
                </h3>
              </div>
              <p className="text-xs text-stone-500">Phê duyệt để chủ quán vào trực tiếp không gian quán</p>
            </div>

            {pendingApprovals.length === 0 ? (
              <div className="py-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-700">Tất cả hồ sơ đã được xử lý</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Không có quán nào đang chờ phê duyệt lúc này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map((p) => {
                  const ownerUser = p.owner || users.find((u) => u.id === p.ownerId);
                  return (
                    <div
                      key={p.id}
                      className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-[#D9452B]" />
                            {p.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                            Chờ Duyệt
                          </span>
                        </div>
                        <p className="text-xs text-stone-600">
                          <strong>Chủ quán:</strong> {ownerUser?.name || 'Chủ quán mới'}
                        </p>
                        <p className="text-xs text-stone-600 flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{ownerUser?.email || p.email || 'Chưa có email'}</span>
                        </p>
                        <p className="text-xs text-stone-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{p.phone || ownerUser?.phone || 'Chưa cung cấp'}</span>
                        </p>
                        <p className="text-xs text-stone-500">
                          <strong>Địa chỉ quán:</strong> {p.address || 'Huyện Ea Súp, Đắk Lắk'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-amber-200/60">
                        <button
                          type="button"
                          onClick={() => handleApproveOwner(ownerUser?.id || p.ownerId, p.id, p.name)}
                          className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Phê Duyệt Kích Hoạt</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleResetOwnerPassword(
                              ownerUser?.id || p.ownerId,
                              ownerUser?.name || 'Chủ Quán',
                              ownerUser?.email || p.email,
                              p.name
                            )
                          }
                          className="py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-rose-200"
                          title="Reset mật khẩu ngẫu nhiên 8 ký tự và gửi email"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reset MK</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectOwner(ownerUser?.id || p.ownerId, p.id, p.name)}
                          className="py-2 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Từ Chối</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MỤC 2: DANH SÁCH CHỦ QUÁN ĐÃ DUYỆT (ACTIVE) */}
          <div className="bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D7]">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-[#D9452B]" />
                <h3 className="font-bold text-[#1C1917] text-sm">Danh Sách Quán Ăn & Chủ Quán Đang Hoạt Động</h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {counts.restaurantsApproved}/{counts.restaurants} quán hoạt động · {counts.owners} chủ quán
              </span>
            </div>

            {loadingUsers ? (
              <div className="py-12 text-center text-xs text-stone-500">Đang tải danh sách chủ quán...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1C1917]">
                  <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Tên Quán & Địa Chỉ</th>
                      <th className="py-3 px-4">Chủ Quán (Gmail)</th>
                      <th className="py-3 px-4">Điện Thoại</th>
                      <th className="py-3 px-4 text-center">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2D7]">
                    {restaurants
                      .filter((r) => r.isApproved)
                      .map((r) => {
                        const ownerUser = r.owner || users.find((u) => u.id === r.ownerId);
                        const isBlocked = ownerUser?.status === 'BLOCKED';
                        return (
                          <tr key={r.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div>
                                <p className="font-bold text-[#1C1917] text-sm flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-[#D9452B]" />
                                  <span>{r.name}</span>
                                </p>
                                <p className="text-[10px] text-stone-500">{r.address}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-semibold text-stone-800">{ownerUser?.name || 'Chủ quán'}</p>
                              <p className="font-mono text-[10px] text-stone-500">{ownerUser?.email || r.email}</p>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-stone-600">
                              {r.phone || ownerUser?.phone || 'Chưa cập nhật'}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isBlocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                                  <Lock className="w-3 h-3" /> Đã Khóa
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã Duyệt (ACTIVE)
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/mon-ngon/${r.slug || ''}`}
                                  target="_blank"
                                  className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Xem giao diện quán"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                                {ownerUser && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleResetOwnerPassword(
                                          ownerUser.id,
                                          ownerUser.name,
                                          ownerUser.email,
                                          r.name
                                        )
                                      }
                                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1 transition-colors border border-rose-200"
                                      title="Reset mật khẩu ngẫu nhiên 8 ký tự và gửi email cho chủ quán"
                                    >
                                      <KeyRound className="w-3 h-3 text-rose-600" />
                                      <span>Reset MK</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUserStatus(ownerUser)}
                                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                                        isBlocked
                                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                      }`}
                                    >
                                      {isBlocked ? 'Mở Khóa' : 'Tạm Khóa'}
                                    </button>
                                  </>
                                )}
                              </div>
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
      )}

      {/* TAB: QUẢN LÝ CÁN BỘ & PHÂN QUYỀN NỘI BỘ (ADMIN, CADRE, EDITOR) */}
      {(activeTab === 'cadres' || activeTab === 'users') && (
        <div className="space-y-6">
          {/* Header & Hướng dẫn phân quyền */}
          <div className="bg-gradient-to-r from-blue-900 to-[#0066CC] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />
                <span>Bảo Mật & Phân Quyền Cán Bộ Nội Bộ</span>
              </div>
              <h2 className="text-xl font-bold font-serif">Quản Lý Danh Sách Cán Bộ Quản Trị Hệ Thống</h2>
              <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
                Tài khoản Cán bộ dành riêng cho Ban quản trị, Đoàn Thanh Niên và cán bộ Văn hóa - Thông tin xã Ea Súp. Đăng nhập trực tiếp bằng tài khoản được cấp (không đăng nhập qua Gmail du khách) để biên tập danh thắng, thuyết minh audio và duyệt nội dung.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
              <KeyRound className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <p className="font-bold text-white">Vai trò cán bộ</p>
                <p className="text-[11px] text-blue-100">ADMIN: Toàn quyền | CADRE / EDITOR: Biên tập</p>
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
            {/* CỘT TRÁI: FORM CẤP TÀI KHOẢN CÁN BỘ MỚI */}
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
                    placeholder="VD: Nguyễn Văn A (Đoàn xã)"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] focus:outline-none focus:border-[#0066CC]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Email công vụ / đăng nhập *</label>
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
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-700">Vai trò cán bộ *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E7E2D7] bg-white focus:outline-none focus:border-[#0066CC]"
                  >
                    <option value="CADRE">Cán Bộ Văn Hóa (CADRE) - Quản lý di tích & thuyết minh</option>
                    <option value="EDITOR">Biên Tập Viên (EDITOR) - Đăng & chỉnh sửa bài viết</option>
                    <option value="ADMIN">Quản Trị Viên (ADMIN) - Toàn quyền quản trị</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full mt-2 py-2.5 px-4 bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creatingUser ? 'Đang tạo...' : 'Lưu Tài Khoản Cán Bộ'}</span>
                </button>
              </form>
            </div>

            {/* CỘT PHẢI: BẢNG DANH SÁCH CÁN BỘ VÀ PHÂN QUYỀN TRỰC TIẾP */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E2D7]">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#0066CC]" />
                  <h3 className="font-bold text-[#1C1917] text-sm">Danh Sách Cán Bộ Phụ Trách</h3>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {counts.cadres} cán bộ
                </span>
              </div>

              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-stone-500">Đang tải danh sách cán bộ...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#1C1917]">
                    <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Cán Bộ</th>
                        <th className="py-3 px-4">Email Đăng Nhập</th>
                        <th className="py-3 px-4 text-center">Vai Trò</th>
                        <th className="py-3 px-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7E2D7]">
                      {users
                        .filter((u) => u.role === 'CADRE' || u.role === 'ADMIN' || u.role === 'EDITOR')
                        .map((u) => {
                          const isSelf = currentUser?.email === u.email;
                          const isSuperAdmin = u.email === 'admin@easup.daklak.gov.vn';
                          return (
                            <tr key={u.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                      u.role === 'ADMIN'
                                        ? 'bg-blue-100 text-[#0066CC]'
                                        : u.role === 'CADRE'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {u.name?.charAt(0)?.toUpperCase() || 'C'}
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
                                    <p className="text-[10px] text-stone-400">ID: {u.id.substring(0, 8)}...</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">{u.email}</td>
                              <td className="py-3.5 px-4 text-center">
                                {isSuperAdmin ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-[#0066CC] border border-blue-300">
                                    <Shield className="w-3 h-3" />
                                    SUPER ADMIN
                                  </span>
                                ) : (
                                  <select
                                    value={u.role || 'CADRE'}
                                    onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                                    className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                                      u.role === 'ADMIN'
                                        ? 'bg-blue-50 text-[#0066CC] border-blue-200'
                                        : u.role === 'CADRE'
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    <option value="ADMIN">ADMIN (Quản trị viên)</option>
                                    <option value="CADRE">CADRE (Cán bộ văn hóa)</option>
                                    <option value="EDITOR">EDITOR (Biên tập viên)</option>
                                  </select>
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
                                    title="Xóa tài khoản cán bộ"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Xóa</span>
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

      {/* TAB 4: QUẢN LÝ MÓN NGON & BÀN ĂN */}
      {activeTab === 'food-tables' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7E2D7] shadow-heritage">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#FDEDE8] text-[#D9452B] grid place-items-center font-bold">
                  <UtensilsCrossed className="w-4 h-4" />
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Quản Trị Bàn Ăn & Ẩm Thực Ea Súp
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Theo dõi các bàn ăn du khách mở, kết nối quán ăn địa phương và xóa các nội dung spam.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/mon-ngon"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D9452B] text-white text-xs font-bold shadow-md shadow-[#D9452B]/20 hover:bg-[#BF3A22] transition-colors"
              >
                <span>Xem Giao Diện Món Ngon</span>
              </Link>
              <button
                type="button"
                onClick={fetchFoodTables}
                className="px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Làm mới
              </button>
            </div>
          </div>

          {tableMsg && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                tableMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{tableMsg.text}</span>
            </div>
          )}

          {/* KPI Bàn ăn */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
              <p className="text-xs text-stone-500 font-medium">Tổng số bàn ăn</p>
              <p className="text-2xl font-serif font-bold text-[#D9452B] mt-1">{foodTables.length}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
              <p className="text-xs text-stone-500 font-medium">Bàn đang mở</p>
              <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">
                {foodTables.filter((t) => !t.isCancelled).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
              <p className="text-xs text-stone-500 font-medium">Bàn đã hủy</p>
              <p className="text-2xl font-serif font-bold text-stone-500 mt-1">
                {foodTables.filter((t) => t.isCancelled).length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#E7E2D7] shadow-sm">
              <p className="text-xs text-stone-500 font-medium">Quán ăn bản địa trên bản đồ</p>
              <p className="text-2xl font-serif font-bold text-[#0066CC] mt-1">
                {destinations.filter((d) => d.categoryId === 'cat-am-thuc' || d.category?.slug === 'am-thuc-quan-ngon').length}
              </p>
            </div>
          </div>

          {/* Bảng danh sách bàn ăn */}
          <div className="bg-white rounded-2xl border border-[#E7E2D7] shadow-heritage overflow-hidden">
            <div className="p-4 border-b border-[#E7E2D7] flex items-center justify-between">
              <h3 className="font-bold text-[#1C1917] text-sm">Danh Sách Bàn Đang Lưu Trữ</h3>
              <span className="text-xs text-stone-500">{foodTables.length} bàn ăn</span>
            </div>

            {loadingTables ? (
              <div className="py-12 text-center text-xs text-stone-500">Đang tải danh sách bàn ăn...</div>
            ) : foodTables.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500">Chưa có bàn ăn nào được tạo.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1C1917]">
                  <thead className="bg-[#FBF9F5] border-b border-[#E7E2D7] text-stone-600 font-semibold">
                    <tr>
                      <th className="py-3 px-4">Món & Quán</th>
                      <th className="py-3 px-4">Thời gian</th>
                      <th className="py-3 px-4">Chủ bàn</th>
                      <th className="py-3 px-4 text-center">Chỗ ngồi</th>
                      <th className="py-3 px-4 text-center">Trạng thái</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E2D7]">
                    {foodTables.map((t) => (
                      <tr key={t.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-bold text-[#1C1917] text-sm">{t.restaurant}</p>
                            <p className="text-[11px] text-[#D9452B] font-semibold mt-0.5">Mã món: {t.dishId}</p>
                            <p className="text-[10px] text-stone-500 truncate max-w-xs">{t.address}</p>
                            {t.note && <p className="text-[10px] text-stone-400 italic mt-0.5">“{t.note}”</p>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-medium text-stone-800">
                            {new Date(t.startAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-[10px] text-stone-400">{t.durationMin} phút</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-stone-800">{t.host}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-full font-bold bg-stone-100 text-stone-700">
                            {t.joined} / {t.capacity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {t.isCancelled ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                              Đã hủy
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Đang mở
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteTable(t.id, t.restaurant)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold transition-colors"
                            title="Xóa bàn này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
