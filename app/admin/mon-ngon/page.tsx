'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Store,
  Users,
  UtensilsCrossed,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  UserCog,
  BadgeAlert,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminDashboardDataAction,
  approveOwnerAction,
  rejectOwnerAction,
  updateUserRoleStatusAction,
  deleteUserAction,
} from '@/actions/admin-actions';
import { Role, UserStatus } from '@/lib/types';

export default function AdminMonNgonPage() {
  const [activeTab, setActiveTab] = useState<'approvals' | 'accounts' | 'overview'>('approvals');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState<any>({
    totalRestaurants: 0,
    approvedRestaurants: 0,
    pendingRestaurants: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalUsers: 0,
  });

  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Search and filters for Accounts
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Processing state
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getAdminDashboardDataAction();
      if (res.success) {
        setStats(res.stats);
        setPendingApprovals(res.pendingApprovals || []);
        setRestaurants(res.restaurants || []);
        setUsers(res.users || []);
      }
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu quản trị: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Approve Owner
  const handleApprove = async (userId: string, restaurantId: string, restaurantName: string) => {
    setProcessingId(restaurantId);
    try {
      const res = await approveOwnerAction(userId, restaurantId);
      if (res.success) {
        toast.success(res.message);
        await loadData(true);
      } else {
        toast.error('Phê duyệt thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi phê duyệt: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject Owner
  const handleReject = async (userId: string, restaurantId: string, restaurantName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn từ chối hồ sơ đăng ký quán "${restaurantName}"?`)) return;

    setProcessingId(restaurantId);
    try {
      const res = await rejectOwnerAction(userId, restaurantId);
      if (res.success) {
        toast.success(res.message);
        await loadData(true);
      } else {
        toast.error('Từ chối thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi từ chối: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Change User Role & Status
  const handleUpdateUser = async (userId: string, newRole: Role, newStatus: UserStatus) => {
    setProcessingId(userId);
    try {
      const res = await updateUserRoleStatusAction(userId, newRole, newStatus);
      if (res.success) {
        toast.success(res.message);
        await loadData(true);
      } else {
        toast.error('Cập nhật thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật tài khoản: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${userName}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    setProcessingId(userId);
    try {
      const res = await deleteUserAction(userId);
      if (res.success) {
        toast.success(res.message);
        await loadData(true);
      } else {
        toast.error('Xóa tài khoản thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi khi xóa: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone || '').includes(userSearch);

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-stone-800 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 hover:bg-stone-100 rounded-xl transition text-stone-600 flex items-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Về Admin Chung</span>
            </Link>
            <div className="h-5 w-[1px] bg-stone-200" />
            <div className="flex items-center gap-2 text-red-600">
              <UtensilsCrossed className="w-5 h-5" />
              <h1 className="font-serif font-bold text-lg text-stone-900 tracking-tight">
                Quản Trị Ẩm Thực & Chủ Quán Ea Súp
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition flex items-center gap-1 text-xs"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-red-600' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
            <Link
              href="/mon-ngon"
              target="_blank"
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition flex items-center gap-1"
            >
              <span>Xem trang Món ngon</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Chờ duyệt</span>
              <BadgeAlert className={`w-4 h-4 ${stats.pendingRestaurants > 0 ? 'text-amber-500' : 'text-stone-400'}`} />
            </div>
            <div className={`text-2xl font-bold ${stats.pendingRestaurants > 0 ? 'text-amber-600' : 'text-stone-800'}`}>
              {stats.pendingRestaurants}
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Quán hoạt động</span>
              <Store className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.approvedRestaurants}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Món đặc sản</span>
              <UtensilsCrossed className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalMenuItems}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Đơn đặt món</span>
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalOrders}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Lượt đặt bàn</span>
              <CalendarDays className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalBookings}</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-xs font-medium">Tổng tài khoản</span>
              <Users className="w-4 h-4 text-stone-500" />
            </div>
            <div className="text-2xl font-bold text-stone-800">{stats.totalUsers}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Phê duyệt Chủ Quán</span>
            {pendingApprovals.length > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'approvals' ? 'bg-white text-red-600' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'accounts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Quản Lý Toàn Bộ Tài Khoản</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {users.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Danh Sách Quán Ăn ({restaurants.length})</span>
          </button>
        </div>

        {/* Tab 1: Pending Approvals */}
        {activeTab === 'approvals' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Danh sách đăng ký mở quán chờ phê duyệt</h2>
                <p className="text-xs text-stone-500">
                  Xem xét thông tin địa bàn, số điện thoại chủ quán trước khi cấp quyền hoạt động.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 text-stone-400">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-500" />
                <p className="text-sm">Đang tải hồ sơ chờ duyệt...</p>
              </div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="font-bold text-stone-800 text-base mb-1">Hiện không có hồ sơ nào chờ duyệt!</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Tất cả các quán ăn đã được thẩm định hoặc chưa có đơn đăng ký mới từ các hộ kinh doanh.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 mb-1.5">
                          <Clock className="w-3 h-3" />
                          Chờ phê duyệt
                        </span>
                        <h3 className="text-base font-bold text-stone-900">{item.name}</h3>
                      </div>
                      {item.coverImage && (
                        <div className="w-14 h-14 rounded-2xl overflow-hidden relative shrink-0 bg-stone-100 border border-stone-200">
                          <Image src={item.coverImage} alt={item.name} fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600 bg-stone-50 p-3 rounded-2xl mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>
                          <strong>Địa chỉ:</strong> {item.address} (Thôn/buôn: {item.village || 'Chưa cập nhật'})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Hotline quán:</strong> {item.phone || 'Chưa có'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>
                          <strong>Giờ mở cửa:</strong> {item.openTime || '07:00'} - {item.closeTime || '22:00'}
                        </span>
                      </div>
                      <div className="h-[1px] bg-stone-200 my-1" />
                      <div className="flex items-center gap-2 text-stone-800">
                        <Users className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span>
                          <strong>Chủ quán:</strong> {item.owner?.name || 'Không rõ'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-stone-500">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.owner?.email || 'Chưa có email'}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item.ownerId, item.id, item.name)}
                        disabled={processingId === item.id}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{processingId === item.id ? 'Đang duyệt...' : 'Chấp thuận phê duyệt'}</span>
                      </button>

                      <button
                        onClick={() => handleReject(item.ownerId, item.id, item.name)}
                        disabled={processingId === item.id}
                        className="py-2.5 px-3 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 font-medium rounded-xl text-xs flex items-center justify-center gap-1 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Account Management (RBAC) */}
        {activeTab === 'accounts' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Quản lý Tài Khoản & Phân Quyền (RBAC)</h2>
                <p className="text-xs text-stone-500">
                  Phân quyền Khách hàng (USER), Chủ quán (OWNER), Cán bộ (CADRE) hoặc Quản trị viên (ADMIN).
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên, email, SĐT..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500 w-48"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="ALL">Mọi Vai Trò (Roles)</option>
                  <option value="USER">USER (Khách)</option>
                  <option value="OWNER">OWNER (Chủ Quán)</option>
                  <option value="CADRE">CADRE (Cán bộ)</option>
                  <option value="ADMIN">ADMIN (Quản trị)</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  <option value="ALL">Mọi Trạng Thái</option>
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="PENDING">PENDING (Chờ duyệt)</option>
                  <option value="BLOCKED">BLOCKED (Bị khóa)</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-medium">
                    <tr>
                      <th className="py-3 px-4">Tài khoản & Email</th>
                      <th className="py-3 px-3">Số điện thoại</th>
                      <th className="py-3 px-3">Vai trò (Role)</th>
                      <th className="py-3 px-3">Trạng thái (Status)</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-stone-400">
                          Không tìm thấy người dùng phù hợp với bộ lọc
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-stone-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 shrink-0">
                                {u.image ? (
                                  <Image src={u.image} alt={u.name || ''} width={32} height={32} className="rounded-full" />
                                ) : (
                                  (u.name?.[0] || 'U').toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-stone-900">{u.name || 'Người dùng'}</div>
                                <div className="text-stone-400 text-[11px]">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                            {u.phone || 'Chưa cập nhật'}
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={u.role || 'USER'}
                              onChange={(e) => handleUpdateUser(u.id, e.target.value as Role, u.status || 'ACTIVE')}
                              disabled={processingId === u.id}
                              className={`px-2 py-1 rounded-lg font-medium text-[11px] border border-transparent focus:border-stone-300 focus:outline-none transition ${
                                u.role === 'ADMIN'
                                  ? 'bg-red-50 text-red-700 font-bold'
                                  : u.role === 'CADRE'
                                  ? 'bg-blue-50 text-blue-700 font-bold'
                                  : u.role === 'OWNER'
                                  ? 'bg-amber-50 text-amber-700 font-bold'
                                  : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              <option value="USER">Khách (USER)</option>
                              <option value="OWNER">Chủ Quán (OWNER)</option>
                              <option value="CADRE">Cán bộ VH (CADRE)</option>
                              <option value="ADMIN">Quản trị (ADMIN)</option>
                            </select>
                          </td>

                          <td className="py-3 px-3">
                            <select
                              value={u.status || 'ACTIVE'}
                              onChange={(e) => handleUpdateUser(u.id, u.role || 'USER', e.target.value as UserStatus)}
                              disabled={processingId === u.id}
                              className={`px-2 py-1 rounded-lg font-medium text-[11px] border border-transparent focus:border-stone-300 focus:outline-none transition ${
                                u.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : u.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              <option value="ACTIVE">Kích hoạt (ACTIVE)</option>
                              <option value="PENDING">Chờ duyệt (PENDING)</option>
                              <option value="BLOCKED">Khóa (BLOCKED)</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                              disabled={processingId === u.id}
                              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Xóa vĩnh viễn tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Overview & Restaurants */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Danh Sách Quán Ăn Tại Ea Súp</h2>
                <p className="text-xs text-stone-500">
                  Xem toàn bộ quán ẩm thực, buôn/thôn và liên kết tới trang đặt món công khai.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mb-1.5 ${
                            res.isApproved
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {res.isApproved ? 'Đã duyệt hoạt động' : 'Đang chờ duyệt'}
                        </span>
                        <h3 className="font-bold text-stone-900 text-base">{res.name}</h3>
                      </div>
                      {res.coverImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-stone-100 border border-stone-200">
                          <Image src={res.coverImage} alt={res.name} fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-stone-600 mb-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{res.address}</span>
                      </div>
                      {res.village && (
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Thôn/buôn: {res.village}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-emerald-600 font-mono">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{res.phone || 'Chưa cập nhật SĐT'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-400">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span>Chủ quán: {res.owner?.name || 'Chưa liên kết'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/mon-ngon/${res.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 transition"
                    >
                      <span>Xem thực đơn & Đặt bàn</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {!res.isApproved && (
                      <button
                        onClick={() => handleApprove(res.ownerId, res.id, res.name)}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
                      >
                        Duyệt ngay
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
