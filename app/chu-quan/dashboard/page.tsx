'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  UtensilsCrossed,
  Users,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Check,
  X,
  FileText,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  MapPin,
} from 'lucide-react';
import {
  getOwnerDashboardDataAction,
  addMenuItemAction,
  updateMenuItemAction,
  deleteMenuItemAction,
  toggleMenuItemAvailabilityAction,
  addTableAction,
  deleteTableAction,
  updateOrderStatusAction,
  updateBookingStatusAction,
  updateRestaurantInfoAction,
  changeOwnerPasswordAction,
} from '@/actions/owner-actions';
import { toast } from 'sonner';

// Danh sách ảnh món ngon đặc sản Ea Súp có sẵn trong kho lưu trữ
const PRESET_DISH_IMAGES = [
  { name: 'Gà nướng bản Đôn', url: '/mon-ngon/ga-nuong.jpg' },
  { name: 'Cơm lam ống tre', url: '/mon-ngon/com-lam.jpg' },
  { name: 'Canh thụt Ê Đê', url: '/mon-ngon/canh-thut.jpg' },
  { name: 'Cá hồ Ea Súp nướng', url: '/mon-ngon/ca-nuong.jpg' },
  { name: 'Lẩu cá lòng hồ', url: '/mon-ngon/lau-ca.jpg' },
  { name: 'Bò một nắng muối kiến', url: '/mon-ngon/bo-mot-nang.jpg' },
  { name: 'Xoài cát Ea Súp', url: '/mon-ngon/xoai-cat.jpg' },
  { name: 'Cà phê Ea Súp', url: '/mon-ngon/ca-phe.jpg' },
];

// Danh sách ảnh bìa quán đặc sắc Ea Súp có sẵn để chọn nhanh
const PRESET_COVER_IMAGES = [
  { name: 'Gà nướng Bản Đôn', url: '/mon-ngon/ga-nuong.jpg' },
  { name: 'Cá lòng hồ nướng', url: '/mon-ngon/ca-nuong.jpg' },
  { name: 'Cơm lam ống tre', url: '/mon-ngon/com-lam.jpg' },
  { name: 'Lẩu cá hồ Ea Súp', url: '/mon-ngon/lau-ca.jpg' },
  { name: 'Cà phê Ea Súp', url: '/mon-ngon/ca-phe.jpg' },
  { name: 'Bò một nắng muối kiến', url: '/mon-ngon/bo-mot-nang.jpg' },
  { name: 'Xoài cát Ea Súp', url: '/mon-ngon/xoai-cat.jpg' },
  { name: 'Rượu cần Tây Nguyên', url: '/mon-ngon/ruou-can.jpg' },
];

export default function OwnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'tables' | 'info' | 'password'>('orders');

  // Đổi mật khẩu chủ quán
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await changeOwnerPasswordAction(passwordForm);
      if (res.success) {
        toast.success(res.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Chỉnh sửa thông tin quán & đổi ảnh bìa
  const [infoEditing, setInfoEditing] = useState(false);
  const [infoLoading, setInfoLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showCoverGallery, setShowCoverGallery] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: '',
    village: '',
    address: '',
    phone: '',
    openTime: '08:00',
    closeTime: '22:00',
    coverImage: '',
    lat: '',
    lng: '',
  });

  const handleStartEditInfo = (r: any) => {
    setInfoForm({
      name: r.name || '',
      village: r.village || '',
      address: r.address || '',
      phone: r.phone || '',
      openTime: r.openTime || '08:00',
      closeTime: r.closeTime || '22:00',
      coverImage: r.coverImage || '',
      lat: r.lat != null ? String(r.lat) : '',
      lng: r.lng != null ? String(r.lng) : '',
    });
    setInfoEditing(true);
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    try {
      const latNum = infoForm.lat.trim() !== '' ? parseFloat(infoForm.lat) : undefined;
      const lngNum = infoForm.lng.trim() !== '' ? parseFloat(infoForm.lng) : undefined;
      const res = await updateRestaurantInfoAction({
        ...infoForm,
        lat: latNum !== undefined && !isNaN(latNum) ? latNum : null,
        lng: lngNum !== undefined && !isNaN(lngNum) ? lngNum : null,
      });
      if (res.success) {
        toast.success(res.message);
        setInfoEditing(false);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể cập nhật thông tin quán');
    } finally {
      setInfoLoading(false);
    }
  };

  // Tải ảnh bìa mới từ máy tính / điện thoại (< 3MB)
  const handleUploadCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP...)');
      return;
    }

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      toast.error(`Ảnh quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Vui lòng chọn ảnh dưới 3MB!`);
      return;
    }

    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi khi tải ảnh bìa lên');
      }

      const imageUrl = resData.url;
      setInfoForm((prev) => ({ ...prev, coverImage: imageUrl }));

      const rest = data?.restaurant;
      if (rest) {
        const saveRes = await updateRestaurantInfoAction({
          name: rest.name,
          village: rest.village,
          address: rest.address,
          phone: rest.phone,
          openTime: rest.openTime,
          closeTime: rest.closeTime,
          coverImage: imageUrl,
        });

        if (saveRes.success) {
          toast.success('Đã cập nhật ảnh bìa quán thành công!');
          loadData();
        } else {
          toast.error(saveRes.message || 'Không thể lưu ảnh bìa');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh bìa lên. Vui lòng thử lại!');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  // Chọn ảnh bìa mẫu từ kho ảnh Ea Súp
  const handleSelectCoverPreset = async (url: string) => {
    setInfoForm((prev) => ({ ...prev, coverImage: url }));
    const rest = data?.restaurant;
    if (!rest) return;
    try {
      setInfoLoading(true);
      const res = await updateRestaurantInfoAction({
        name: rest.name,
        village: rest.village,
        address: rest.address,
        phone: rest.phone,
        openTime: rest.openTime,
        closeTime: rest.closeTime,
        coverImage: url,
      });
      if (res.success) {
        toast.success('Đã thay đổi ảnh bìa quán!');
        setShowCoverGallery(false);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật ảnh bìa');
    } finally {
      setInfoLoading(false);
    }
  };

  // Modal thêm/sửa món
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [dishLoading, setDishLoading] = useState(false);
  const [editingDish, setEditingDish] = useState<any | null>(null);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [customGallery, setCustomGallery] = useState<{ name: string; url: string }[]>([]);

  const [dishForm, setDishForm] = useState({
    name: '',
    price: 150000,
    category: 'Món chính',
    description: '',
    image: '/mon-ngon/ga-nuong.jpg',
  });

  // Xử lý upload ảnh món ăn dưới 3MB
  const handleUploadDishImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP...)');
      return;
    }

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      toast.error(`Ảnh quá lớn (${(file.size / (1024 * 1024)).toFixed(1)}MB). Vui lòng chọn ảnh dưới 3MB!`);
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.message || 'Lỗi khi tải ảnh lên');
      }

      const imageUrl = resData.url;
      setDishForm((prev: any) => ({ ...prev, image: imageUrl }));

      const newImgItem = { name: file.name.substring(0, 20), url: imageUrl };
      setCustomGallery((prev) => [newImgItem, ...prev]);

      toast.success('Tải ảnh món ăn lên thành công!');
    } catch (err: any) {
      toast.error(err.message || 'Không thể tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Modal thêm bàn
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableForm, setTableForm] = useState({
    name: 'Bàn mới',
    capacity: 4,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getOwnerDashboardDataAction();
      if (res.success) {
        setData(res);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Không có quyền truy cập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Xử lý duyệt / từ chối đơn đặt món
  const handleOrderStatus = async (orderId: string, status: any) => {
    try {
      const res = await updateOrderStatusAction(orderId, status);
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

  // Xử lý duyệt / từ chối đặt bàn
  const handleBookingStatus = async (bookingId: string, status: any) => {
    try {
      const res = await updateBookingStatusAction(bookingId, status);
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

  // Mở modal thêm món mới
  const handleOpenAddDish = () => {
    setEditingDish(null);
    setShowImageGallery(false);
    setDishForm({
      name: '',
      price: 150000,
      category: 'Món chính',
      description: '',
      image: '/mon-ngon/ga-nuong.jpg',
    });
    setDishModalOpen(true);
  };

  // Mở modal sửa món
  const handleOpenEditDish = (item: any) => {
    setEditingDish(item);
    setShowImageGallery(false);
    setDishForm({
      name: item.name,
      price: item.price,
      category: item.category || 'Món chính',
      description: item.description || '',
      image: item.image || '/mon-ngon/ga-nuong.jpg',
    });
    setDishModalOpen(true);
  };

  // Xử lý lưu món (Tạo mới hoặc Cập nhật)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishForm.name || !dishForm.price) return;
    setDishLoading(true);
    try {
      let res;
      if (editingDish) {
        res = await updateMenuItemAction(editingDish.id, dishForm);
      } else {
        res = await addMenuItemAction(dishForm);
      }

      if (res.success) {
        toast.success(res.message);
        setDishModalOpen(false);
        setEditingDish(null);
        setDishForm({
          name: '',
          price: 150000,
          category: 'Món nướng đặc sản',
          description: '',
          image: '/mon-ngon/ga-nuong.jpg',
        });
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDishLoading(false);
    }
  };

  // Xóa món
  const handleDeleteDish = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa món "${name}"?`)) return;
    try {
      const res = await deleteMenuItemAction(id);
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

  // Bật tắt hết món
  const handleToggleDish = async (id: string, currentAvailable: boolean) => {
    try {
      const res = await toggleMenuItemAvailabilityAction(id, !currentAvailable);
      if (res.success) {
        toast.success(res.message);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Thêm bàn
  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setTableLoading(true);
    try {
      const res = await addTableAction(tableForm);
      if (res.success) {
        toast.success(res.message);
        setTableModalOpen(false);
        loadData();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTableLoading(false);
    }
  };

  // Xóa bàn
  const handleDeleteTable = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bàn này?')) return;
    try {
      const res = await deleteTableAction(id);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#D9452B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-semibold">Đang tải không gian làm việc của chủ quán...</p>
        </div>
      </div>
    );
  }

  // RÀO CẢN PHÂN QUYỀN
  if (authError || !data?.restaurant) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-[#1C1917]">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E2D7] p-8 shadow-heritage text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1C1917]">
            Khu Vực Dành Riêng Cho Chủ Quán
          </h1>
          <p className="text-xs text-stone-600 leading-relaxed">
            {authError || 'Bạn cần đăng nhập tài khoản có vai trò Chủ Quán Ăn (OWNER) đã được Ban Quản Trị phê duyệt để truy cập Dashboard này.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/mon-ngon/dang-nhap-chu-quan"
              className="py-3 px-5 rounded-2xl bg-[#D9452B] text-white text-xs font-bold hover:bg-[#BF3A22] transition-colors"
            >
              Đăng nhập Chủ Quán
            </Link>
            <Link
              href="/mon-ngon/dang-ky-chu-quan"
              className="py-3 px-5 rounded-2xl bg-white border border-[#E7E2D7] text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
            >
              Đăng ký mở quán mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { restaurant, user, menuItems, tables, orders, bookings } = data;
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING');
  const pendingBookings = bookings.filter((b: any) => b.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1C1917] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E7E2D7] sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/mon-ngon"
              className="p-2 rounded-xl border border-[#E7E2D7] text-stone-600 hover:text-[#D9452B] hover:bg-stone-50 transition-colors shrink-0"
              title="Quay lại Món Ngon"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#FDEDE8] text-[#D9452B] flex items-center justify-center font-bold text-xs shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </span>
                <h1 className="font-serif text-lg font-bold text-[#1C1917] truncate">
                  {restaurant.name}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 shrink-0">
                  Đã Duyệt (ACTIVE)
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate">
                Chủ quán: <strong>{user.name}</strong> • {restaurant.village || 'Ea Súp'}
              </p>
            </div>
          </div>

          {/* Quick stats badges */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingOrders.length} đơn chờ duyệt</span>
            </span>
            <Link
              href={`/mon-ngon/${restaurant.slug}`}
              target="_blank"
              className="text-xs px-3 py-1 rounded-xl bg-stone-100 text-stone-700 hover:bg-[#D9452B] hover:text-white transition-colors font-semibold"
            >
              Xem trang quán ăn/uống ↗
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
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
            <Clock className="w-4 h-4" />
            <span>Đơn Đặt Món & Đặt Bàn ({pendingOrders.length + pendingBookings.length} chờ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'menu'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Quản Lý Thực Đơn ({menuItems.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tables')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'tables'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản Lý Bàn Ăn/Uống ({tables.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'info'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Thông Tin Quán Ăn/Uống</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'password'
                ? 'bg-[#D9452B] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-[#E7E2D7] hover:bg-stone-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi Mật Khẩu</span>
          </button>
        </div>

        {/* TAB 1: ĐƠN ĐẶT MÓN & ĐẶT BÀN */}
        {activeTab === 'orders' && (
          <div className="mt-6 space-y-8">
            {/* ĐƠN ĐẶT MÓN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#D9452B]" />
                    <span>Đơn Đặt Món Ăn/Uống ({orders.length})</span>
                  </h2>
                  <p className="text-xs text-stone-500">
                    Độc quyền chỉ hiển thị các đơn khách gửi tới quán của bạn
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E7E2D7] p-8 text-center text-xs text-stone-500">
                  Chưa có đơn đặt món ăn/uống nào gửi tới quán.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-[#E7E2D7] p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              order.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : order.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'REJECTED' || order.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-[#0066CC]'
                            }`}
                          >
                            {order.status === 'PENDING'
                              ? 'Chờ duyệt'
                              : order.status === 'APPROVED'
                              ? 'Đã xác nhận'
                              : order.status === 'REJECTED'
                              ? 'Đã từ chối'
                              : order.status === 'CANCELLED'
                              ? 'Khách hủy'
                              : 'Hoàn thành'}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>

                        {/* Thông tin Khách hàng đặt món (Tên và Số điện thoại) */}
                        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#D9452B]" />
                              Khách Hàng Đặt Món
                            </span>
                            <span className="text-[10px] text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200 font-semibold">
                              Liên hệ trực tiếp
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#1C1917]">{order.customerName}</p>
                          <a
                            href={`tel:${order.customerPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-1 w-full justify-center"
                            title="Bấm để gọi điện thoại trực tiếp cho khách hàng"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Gọi điện: {order.customerPhone}</span>
                          </a>
                        </div>

                        {/* Danh sách món */}
                        <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                          {order.orderItems?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-stone-700">
                              <span className="font-medium">
                                {item.menuItem?.name || 'Món ăn'} <strong className="text-[#D9452B]">x{item.quantity}</strong>
                              </span>
                              <span className="font-mono text-stone-500 text-[11px]">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          ))}
                          <div className="border-t border-stone-200 pt-1 mt-1 flex justify-between font-bold text-sm text-[#1C1917]">
                            <span>Tổng tiền:</span>
                            <span className="text-[#D9452B] font-mono">
                              {order.totalAmount?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        {order.note && (
                          <p className="text-[11px] text-stone-500 italic bg-amber-50/50 p-2 rounded-lg">
                            "{order.note}"
                          </p>
                        )}
                      </div>

                      {/* NÚT THAO TÁC DUYỆT ĐƠN */}
                      {order.status === 'PENDING' && (
                        <div className="pt-2 flex gap-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleOrderStatus(order.id, 'APPROVED')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Phê Duyệt Đơn</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOrderStatus(order.id, 'REJECTED')}
                            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-semibold transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {order.status === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => handleOrderStatus(order.id, 'COMPLETED')}
                          className="w-full py-1.5 rounded-xl bg-blue-50 text-[#0066CC] hover:bg-blue-100 text-xs font-bold transition-colors"
                        >
                          Đánh dấu đã phục vụ xong
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ĐẶT BÀN TRƯỚC */}
            <div className="space-y-4 pt-6 border-t border-[#E7E2D7]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#0066CC]" />
                  <span>Lịch Đặt Bàn Trước ({bookings.length})</span>
                </h2>
                <p className="text-xs text-stone-500">Khách hẹn trước bàn ăn tại quán</p>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E7E2D7] p-8 text-center text-xs text-stone-500">
                  Chưa có lịch đặt bàn trước nào.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="bg-white rounded-2xl border border-[#E7E2D7] p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              b.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : b.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {b.status === 'PENDING' ? 'Chờ xác nhận bàn' : b.status === 'APPROVED' ? 'Đã giữ bàn' : 'Hủy'}
                          </span>
                          <span className="text-[11px] font-bold text-[#D9452B]">
                            {b.guestCount} người
                          </span>
                        </div>

                        {/* Thông tin Khách hàng đặt bàn (Tên và Số điện thoại) */}
                        <div className="bg-blue-50/80 border border-blue-200/90 rounded-2xl p-3 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-3 h-3 text-[#0066CC]" />
                              Khách Hàng Đặt Bàn
                            </span>
                            <span className="text-[10px] text-blue-800 bg-white px-2 py-0.5 rounded-full border border-blue-200 font-semibold">
                              {b.guestCount} người
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#1C1917]">{b.customerName}</p>
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs mt-1 w-full justify-center"
                            title="Bấm để gọi điện thoại trực tiếp cho khách"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Gọi điện: {b.customerPhone}</span>
                          </a>
                        </div>

                        <div className="p-2.5 bg-blue-50/50 rounded-xl space-y-1 text-xs text-stone-700">
                          <p className="flex items-center gap-1 font-semibold text-[#0066CC]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Giờ đến: {new Date(b.bookingTime).toLocaleString('vi-VN')}</span>
                          </p>
                          {b.note && <p className="italic text-stone-500">"{b.note}"</p>}
                        </div>
                      </div>

                      {b.status === 'PENDING' && (
                        <div className="pt-2 flex gap-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => handleBookingStatus(b.id, 'APPROVED')}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                          >
                            Xác Nhận Giữ Bàn
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBookingStatus(b.id, 'REJECTED')}
                            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 text-xs font-semibold transition-colors"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: QUẢN LÝ THỰC ĐƠN */}
        {activeTab === 'menu' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                  Thực Đơn Món Ăn/Uống Của Quán
                </h2>
                <p className="text-xs text-stone-500">Thêm, sửa, xóa và bật/tắt trạng thái phục vụ món ăn & giải khát</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddDish}
                className="py-2.5 px-4 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Món Ăn/Uống Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems.map((item: any) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E7E2D7] p-3 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100">
                      <img src={item.image || '/mon-ngon/ga-nuong.jpg'} alt={item.name} className="w-full h-full object-cover" />
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#1C1917]">{item.name}</h3>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{item.description}</p>
                      <p className="text-sm font-bold text-[#D9452B] font-mono mt-1">
                        {item.price?.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleDish(item.id, item.isAvailable)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {item.isAvailable ? 'Đang phục vụ' : 'Tạm hết món'}
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditDish(item)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Chỉnh sửa món ăn/uống"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(item.id, item.name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Xóa món ăn/uống"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ BÀN ĂN/UỐNG */}
        {activeTab === 'tables' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                  Danh Sách Bàn Ăn/Uống Tại Quán
                </h2>
                <p className="text-xs text-stone-500">Quản lý sơ đồ bàn và sức chứa</p>
              </div>
              <button
                type="button"
                onClick={() => setTableModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-[#0066CC] hover:bg-[#0055AA] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Bàn Ăn/Uống</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table: any) => (
                <div
                  key={table.id}
                  className="bg-white rounded-2xl border border-[#E7E2D7] p-4 shadow-xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {table.status === 'AVAILABLE' ? 'Bàn trống' : 'Đang dùng'}
                    </span>
                    <h3 className="font-bold text-sm text-[#1C1917] mt-1">{table.name}</h3>
                    <p className="text-xs text-stone-500">Sức chứa: <strong>{table.capacity} khách</strong></p>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteTable(table.id)}
                      className="p-1 rounded-lg text-stone-400 hover:text-red-600 transition-colors"
                      title="Xóa bàn ăn/uống"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: THÔNG TIN QUÁN */}
        {activeTab === 'info' && (
          <div className="mt-6 max-w-2xl bg-white rounded-3xl border border-[#E7E2D7] p-6 shadow-xs space-y-6">
            {/* KHỐI ẢNH BÌA QUÁN ĂN/UỐNG */}
            <div className="space-y-3 pb-6 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#1C1917] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#D9452B]" />
                    <span>Ảnh Bìa Quán Ăn/Uống</span>
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ảnh hiển thị nổi bật ở đầu trang giới thiệu các món ăn/uống và giải khát của bạn
                  </p>
                </div>
              </div>

              {/* Preview Ảnh Bìa */}
              <div className="relative aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 group shadow-xs">
                <img
                  src={infoForm.coverImage || restaurant.coverImage || '/mon-ngon/ga-nuong.jpg'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9452B]">
                      {restaurant.village || 'Ea Súp'}
                    </span>
                    <h4 className="font-serif text-lg font-bold mt-1 text-white drop-shadow-xs">{restaurant.name}</h4>
                    <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#F5B82E]" />
                      <span>{restaurant.openTime || '08:00'} – {restaurant.closeTime || '22:00'}</span>
                    </p>
                  </div>
                </div>

                {uploadingCover && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang tải ảnh bìa lên hệ thống...</span>
                  </div>
                )}
              </div>

              {/* Bộ nút thao tác đổi ảnh bìa */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <label
                  htmlFor="cq-cover-upload"
                  className="py-2 px-3.5 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingCover ? 'Đang tải lên...' : '📷 Tải ảnh bìa mới (< 3MB)'}</span>
                </label>
                <input
                  id="cq-cover-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleUploadCoverImage}
                  disabled={uploadingCover}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => setShowCoverGallery(!showCoverGallery)}
                  className="py-2 px-3.5 rounded-xl bg-white border border-stone-200 hover:border-[#D9452B] text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
                  <span>Kho ảnh bìa đẹp Ea Súp</span>
                  {showCoverGallery ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Kho ảnh bìa sổ ra */}
              {showCoverGallery && (
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="font-bold flex items-center gap-1">
                      <FolderOpen className="w-3.5 h-3.5 text-[#D9452B]" />
                      <span>Chọn ảnh bìa quán & món ngon Ea Súp</span>
                    </span>
                    <span className="text-[11px] text-stone-400">Bấm ảnh để đổi ngay</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_COVER_IMAGES.map((img, idx) => {
                      const isCurrent = (infoForm.coverImage || restaurant.coverImage) === img.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCoverPreset(img.url)}
                          className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all ${
                            isCurrent
                              ? 'border-[#D9452B] ring-2 ring-[#D9452B]/30'
                              : 'border-stone-200 hover:border-[#D9452B]'
                          }`}
                        >
                          <div className="aspect-[16/10] bg-stone-200 overflow-hidden">
                            <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <span className="block text-[10px] p-1.5 font-medium text-stone-700 truncate bg-white">
                            {img.name}
                          </span>
                          {isCurrent && (
                            <span className="absolute top-1 right-1 bg-[#D9452B] text-white rounded-full p-0.5 shadow-xs">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* THÔNG TIN CHI TIẾT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-[#1C1917]">Hồ Sơ Quán Ăn/Uống</h2>
                {!infoEditing && (
                  <button
                    id="cq-info-edit-btn"
                    type="button"
                    onClick={() => handleStartEditInfo(restaurant)}
                    className="py-2 px-3.5 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>
                )}
              </div>

              {infoEditing ? (
                <form onSubmit={handleSaveInfo} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-stone-700">Tên quán ăn/uống *</label>
                    <input
                      id="cq-info-name"
                      type="text"
                      required
                      value={infoForm.name}
                      onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-stone-700">Thôn / Buôn</label>
                    <input
                      id="cq-info-village"
                      type="text"
                      placeholder="VD: Buôn A2"
                      value={infoForm.village}
                      onChange={(e) => setInfoForm({ ...infoForm, village: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-stone-700">Địa chỉ quán ăn/uống *</label>
                    <input
                      id="cq-info-address"
                      type="text"
                      required
                      value={infoForm.address}
                      onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-stone-700">Số điện thoại liên hệ</label>
                    <input
                      id="cq-info-phone"
                      type="tel"
                      value={infoForm.phone}
                      onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold mb-1 text-stone-700">Giờ mở cửa</label>
                      <input
                        id="cq-info-open"
                        type="time"
                        value={infoForm.openTime}
                        onChange={(e) => setInfoForm({ ...infoForm, openTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-stone-700">Giờ đóng cửa</label>
                      <input
                        id="cq-info-close"
                        type="time"
                        value={infoForm.closeTime}
                        onChange={(e) => setInfoForm({ ...infoForm, closeTime: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                      />
                    </div>
                  </div>

                  {/* Tọa độ vị trí quán X, Y */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-stone-700">
                        Tọa độ bản đồ (X, Y) <span className="text-stone-400 font-normal text-[11px]">(Không bắt buộc)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof navigator !== 'undefined' && navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (pos) => {
                                setInfoForm((prev) => ({
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
                        <MapPin className="w-3 h-3" />
                        <span>Lấy vị trí hiện tại</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Tọa độ X (Kinh độ)
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="VD: 107.881234"
                          value={infoForm.lng}
                          onChange={(e) => setInfoForm({ ...infoForm, lng: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                          Tọa độ Y (Vĩ độ)
                        </span>
                        <input
                          type="number"
                          step="any"
                          placeholder="VD: 13.245678"
                          value={infoForm.lat}
                          onChange={(e) => setInfoForm({ ...infoForm, lat: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInfoEditing(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                    >
                      Hủy
                    </button>
                    <button
                      id="cq-info-save"
                      type="submit"
                      disabled={infoLoading}
                      className="px-5 py-2 rounded-xl bg-[#D9452B] text-white font-bold hover:bg-[#BF3A22] transition-colors disabled:opacity-60"
                    >
                      {infoLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-xs text-stone-700">
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Tên quán ăn/uống:</span>
                    <span className="font-bold text-sm text-[#1C1917]">{restaurant.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Thôn / Buôn:</span>
                    <span>{restaurant.village || 'Ea Súp'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Địa chỉ quán:</span>
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Số điện thoại:</span>
                    <span className="font-mono text-[#D9452B] font-bold">{restaurant.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Giờ hoạt động:</span>
                    <span>{restaurant.openTime || '08:00'} – {restaurant.closeTime || '22:00'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Tọa độ bản đồ (X, Y):</span>
                    <span className="font-mono text-stone-700">
                      {restaurant.lat && restaurant.lng
                        ? `X: ${restaurant.lng}, Y: ${restaurant.lat}`
                        : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-stone-100">
                    <span className="text-stone-500 font-semibold">Trạng thái kiểm duyệt:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Đã được Ban Quản Trị phê duyệt
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: ĐỔI MẬT KHẨU CHỦ QUÁN */}
        {activeTab === 'password' && (
          <div className="mt-6 max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-[#E7E2D7] p-6 sm:p-8 shadow-heritage space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#E7E2D7]">
                <div className="w-12 h-12 rounded-2xl bg-[#FDEDE8] text-[#D9452B] flex items-center justify-center font-bold shrink-0 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#1C1917]">
                    Đổi Mật Khẩu Không Gian Quán
                  </h2>
                  <p className="text-xs text-stone-500">
                    Cập nhật mật khẩu mới để bảo vệ an toàn cho tài khoản quán của bạn
                  </p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Mật khẩu hiện tại
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu hiện tại..."
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                      aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    Nếu bạn đăng ký qua Google hoặc chưa đặt mật khẩu trước đó, có thể để trống hoặc nhập mật khẩu khởi tạo ban đầu.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Mật khẩu mới <span className="text-red-500">*</span> (tối thiểu 6 ký tự)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập mật khẩu mới..."
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#D9452B] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                      aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="Nhập lại chính xác mật khẩu mới..."
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-3 px-4 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold shadow-md shadow-[#D9452B]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {passwordLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>Cập Nhật Mật Khẩu Mới</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODAL THÊM / CHỈNH SỬA MÓN ĂN/UỐNG */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">
                {editingDish ? 'Chỉnh Sửa Món Ăn/Uống' : 'Thêm Món Ăn/Uống Mới'}
              </h3>
              <button
                onClick={() => {
                  setDishModalOpen(false);
                  setEditingDish(null);
                  setShowImageGallery(false);
                }}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-stone-700">Tên món ăn/uống *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Gà Nướng Mọi Bản Đôn hoặc Trà Trái Cây Ea Súp"
                  value={dishForm.name}
                  onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-stone-700">Danh mục</label>
                  <select
                    value={dishForm.category}
                    onChange={(e) => setDishForm({ ...dishForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="Món chính">Món chính</option>
                    <option value="Đặc sản Tây Nguyên">Đặc sản Tây Nguyên</option>
                    <option value="Ăn vặt / Giải khát">Ăn vặt / Giải khát</option>
                    <option value="Đồ uống & Trà cà phê">Đồ uống & Trà cà phê</option>
                  </select>
                </div>
              </div>

              {/* PHẦN CHỌN / TẢI HÌNH ẢNH MÓN ĂN/UỐNG (DƯỚI 3MB HOẶC CHỌN KHO) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-stone-700">Hình ảnh món ăn/uống</label>
                  <span className="text-[11px] text-stone-400">Tối đa 3MB (JPG, PNG, WebP)</span>
                </div>

                <div className="p-3 rounded-2xl border border-stone-200 bg-[#FBF9F5] space-y-2.5">
                  <div className="flex items-center gap-3">
                    {/* Ảnh Preview */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 shrink-0 relative shadow-xs">
                      {dishForm.image ? (
                        <img
                          src={dishForm.image}
                          alt={dishForm.name || 'Ảnh món ăn/uống'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 text-[10px]">
                          <ImageIcon className="w-6 h-6 mb-0.5" />
                          <span>Chưa có ảnh</span>
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {/* 1. Nút upload ảnh từ máy (< 3MB) */}
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-300 hover:border-[#D9452B] text-stone-700 hover:text-[#D9452B] text-[11px] font-semibold transition-colors shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingImage ? 'Đang tải lên...' : 'Tải ảnh từ máy (< 3MB)'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handleUploadDishImage}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>

                        {/* 2. Nút sổ ra kho lưu trữ ảnh */}
                        <button
                          type="button"
                          onClick={() => setShowImageGallery(!showImageGallery)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-colors shadow-xs ${
                            showImageGallery
                              ? 'bg-[#D9452B] text-white border-[#D9452B]'
                              : 'bg-white border-stone-300 hover:border-[#D9452B] text-stone-700 hover:text-[#D9452B]'
                          }`}
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Kho lưu trữ ảnh</span>
                          {showImageGallery ? (
                            <ChevronUp className="w-3 h-3 ml-0.5" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-0.5" />
                          )}
                        </button>
                      </div>

                      <p className="text-[10px] text-stone-500 truncate max-w-[240px]">
                        Đang chọn: <span className="font-mono text-stone-700 font-semibold">{dishForm.image || 'Mặc định'}</span>
                      </p>
                    </div>
                  </div>

                  {/* KHO LƯU TRỮ ẢNH SỔ RA */}
                  {showImageGallery && (
                    <div className="pt-2.5 border-t border-stone-200 animate-in fade-in slide-in-from-top-1 duration-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#D9452B]" />
                          <span>Kho ảnh món ăn/uống ngon Ea Súp ({PRESET_DISH_IMAGES.length + customGallery.length})</span>
                        </span>
                        <span className="text-[10px] text-stone-400">Nhấp vào ảnh để chọn</span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1.5 bg-white rounded-xl border border-stone-200">
                        {/* Ảnh do chủ quán mới tải lên */}
                        {customGallery.map((item, idx) => {
                          const isSelected = dishForm.image === item.url;
                          return (
                            <button
                              key={`custom-${idx}`}
                              type="button"
                              onClick={() => {
                                setDishForm((prev: any) => ({ ...prev, image: item.url }));
                              }}
                              className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all ${
                                isSelected
                                    ? 'border-[#D9452B] ring-2 ring-[#D9452B]/30'
                                  : 'border-stone-100 hover:border-stone-300'
                              }`}
                            >
                              <div className="aspect-square bg-stone-100 overflow-hidden">
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <span className="block text-[9px] p-1 truncate font-medium text-stone-700 bg-white">
                                {item.name}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1 right-1 bg-[#D9452B] text-white rounded-full p-0.5 shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}

                        {/* Danh sách ảnh mẫu đặc sản có sẵn */}
                        {PRESET_DISH_IMAGES.map((item, idx) => {
                          const isSelected = dishForm.image === item.url;
                          return (
                            <button
                              key={`preset-${idx}`}
                              type="button"
                              onClick={() => {
                                setDishForm((prev: any) => ({ ...prev, image: item.url }));
                              }}
                              className={`relative group rounded-xl overflow-hidden border-2 text-left transition-all ${
                                isSelected
                                  ? 'border-[#D9452B] ring-2 ring-[#D9452B]/30'
                                  : 'border-stone-100 hover:border-stone-300'
                              }`}
                            >
                              <div className="aspect-square bg-stone-100 overflow-hidden">
                                <img src={item.url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              </div>
                              <span className="block text-[9px] p-1 truncate font-medium text-stone-700 bg-white">
                                {item.name}
                              </span>
                              {isSelected && (
                                <span className="absolute top-1 right-1 bg-[#D9452B] text-white rounded-full p-0.5 shadow-xs">
                                  <Check className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Mô tả ngắn</label>
                <textarea
                  rows={2}
                  placeholder="Nguyên liệu, cách chế biến đặc biệt..."
                  value={dishForm.description}
                  onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#D9452B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDishModalOpen(false);
                    setEditingDish(null);
                    setShowImageGallery(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={dishLoading}
                  className="px-5 py-2 rounded-xl bg-[#D9452B] text-white font-bold hover:bg-[#BF3A22] transition-colors"
                >
                  {dishLoading ? 'Đang lưu...' : editingDish ? 'Lưu Món Ăn/Uống' : 'Tạo Món Ăn/Uống'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM BÀN ĂN/UỐNG */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="font-serif font-bold text-lg text-[#1C1917]">Thêm Bàn Ăn/Uống Mới</h3>
              <button onClick={() => setTableModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTable} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-stone-700">Tên bàn ăn/uống *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bàn 5 hoặc Chòi VIP 2"
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-700">Sức chứa (Số ghế)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={tableForm.capacity}
                  onChange={(e) => setTableForm({ ...tableForm, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={tableLoading}
                  className="px-5 py-2 rounded-xl bg-[#0066CC] text-white font-bold hover:bg-[#0055AA] transition-colors"
                >
                  {tableLoading ? 'Đang thêm...' : 'Thêm Bàn Ăn/Uống'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
