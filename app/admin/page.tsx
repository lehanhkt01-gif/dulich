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
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingDest, setEditingDest] = useState<Destination | null>(null);

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

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D7] pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <img
              src="/logo-easup-official.png"
              alt="Logo Xã Ea Súp"
              className="w-7 h-7 rounded-full border border-[#0066CC] shrink-0"
            />
            <span className="text-xs font-bold text-[#0066CC] uppercase tracking-wider">
              ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK (XÃ EA SÚP)
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Quản Trị Hệ Thống: DU LỊCH EA SÚP
          </h1>
          <p className="text-xs text-[#A64B2A] font-bold uppercase tracking-wider mt-1">
            BẢN SẮC, DẤU ẤN ĐẠI NGÀN TÂY NGUYÊN
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E7E2D7] text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Xem Trang Chủ</span>
          </Link>
          <button
            onClick={() => {
              setEditingDest(null);
              setActiveTab(activeTab === 'create' ? 'list' : 'create');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold shadow transition-all"
          >
            {activeTab === 'create' ? <FileText className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{activeTab === 'create' ? 'Xem Danh Sách' : 'Thêm Mới Danh Thắng'}</span>
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

      {/* GPS Picker Modal */}
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
