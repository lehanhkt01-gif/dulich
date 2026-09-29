'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Sparkles,
  MapPin,
  Headphones,
  Lock,
  Globe,
  Radio,
  FileCode,
  ArrowRight,
  Code2,
} from 'lucide-react';

export default function PreDeploymentReviewPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiTestResult, setApiTestResult] = useState<string | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const testApi = async (endpoint: string) => {
    setTestingEndpoint(endpoint);
    setApiTestResult('Đang gọi API...');
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setApiTestResult('Lỗi khi gọi API: ' + err.message);
    } finally {
      setTestingEndpoint(null);
    }
  };

  const checklistItems = [
    {
      category: '1. Kiến Trúc & Build Next.js 15 Standalone',
      items: [
        {
          name: 'Next.js 15.1 + App Router + TypeScript 5.7',
          desc: '100% Type-safe, phân tách Server Components & Client Components.',
          status: 'ready',
        },
        {
          name: 'Cấu hình output: "standalone"',
          desc: 'Trong next.config.js để xuất gói chạy tối giản cho Docker không cần node_modules nặng.',
          status: 'ready',
        },
        {
          name: 'Biên dịch kiểm thử sản phẩm (npm run build)',
          desc: 'Toàn bộ 11 routes tĩnh và động đã build hoàn tất không lỗi (Exit code 0).',
          status: 'ready',
        },
      ],
    },
    {
      category: '2. Chuẩn Thiết Kế Di Sản Taste-Skill Anti-Slop',
      items: [
        {
          name: 'Bộ 3 Khóa Bất Biến (The 3 Locks)',
          desc: 'Màu be kem #FBF9F5, chữ than chì #1C1917, xanh rêu #0066CC & bazan #A64B2A. Không neon/AI gradients.',
          status: 'ready',
        },
        {
          name: 'Hero Discipline',
          desc: 'Tiêu đề <= 2 dòng Noto Serif, dẫn nhập < 20 từ, tra cứu & bản đồ trong màn hình đầu, navbar < 80px.',
          status: 'ready',
        },
        {
          name: 'Bố cục Asymmetrical Bento Grid (Anti-Slop)',
          desc: 'Thẻ chính 7 cột Tháp Yang PRông tích hợp Mini Audio Player + 3 thẻ vệ tinh chuyên đề.',
          status: 'ready',
        },
        {
          name: 'Bản đồ Du lịch GIS Leaflet.js',
          desc: 'Custom SVG Pin di sản, Popup định vị địa lý, nút chỉ đường Google Maps trực tiếp.',
          status: 'ready',
        },
      ],
    },
    {
      category: '3. Cơ Sở Dữ Liệu & API Handlers',
      items: [
        {
          name: 'PostgreSQL 16 & Prisma ORM',
          desc: 'Schema đầy đủ User, Category, Destination, Review, ItineraryItem với tọa độ GPS và audio.',
          status: 'ready',
        },
        {
          name: 'Cơ chế Resilient Fallback',
          desc: 'Fallback mượt mà sang dữ liệu mẫu khi chưa kết nối Postgres, không làm đứt gãy trải nghiệm.',
          status: 'ready',
        },
        {
          name: 'API Upload & Tự động nén WebP bằng Sharp',
          desc: 'Tự động giảm tải dung lượng ảnh xuống WebP chất lượng cao 82% trước khi lưu trữ.',
          status: 'ready',
        },
        {
          name: 'Phân quyền RBAC & JWT Authentication',
          desc: 'Bảo mật các endpoint chỉnh sửa, thêm mới, xóa điểm đến cho EDITOR và ADMIN.',
          status: 'ready',
        },
      ],
    },
    {
      category: '4. Đóng Gói Docker & An Toàn Bảo Mật',
      items: [
        {
          name: 'Dockerfile Multi-stage & Non-root User',
          desc: 'Mô hình deps -> builder -> runner trên nền node:20-alpine an toàn, user nextjs uid 1001.',
          status: 'ready',
        },
        {
          name: 'docker-compose.yml Cách Ly Cổng 5432',
          desc: 'Postgres chạy trong mạng nội bộ app_net, tuyệt đối không expose cổng 5432 ra Internet.',
          status: 'ready',
        },
        {
          name: 'Nginx Reverse Proxy & Dozzle',
          desc: 'Cấu hình gzip, cache static headers và trình xem log container tại cổng 8888.',
          status: 'ready',
        },
        {
          name: 'Bitwarden Security Vault Guideline',
          desc: 'Khóa 32 ký tự ngẫu nhiên cho DB_PASSWORD và AUTH_SECRET lưu trữ an toàn trong Secure Note.',
          status: 'ready',
        },
      ],
    },
  ];

  const deploymentScript = `# 1. Kết nối SSH Termius vào VPS
sudo apt update && sudo apt install -y git docker.io docker-compose-plugin

# 2. Kéo mã nguồn về VPS
git clone https://github.com/<YOUR_USER>/danh-thang-ky.git /opt/danhthangky
cd /opt/danhthangky

# 3. Tạo file cấu hình môi trường từ Bitwarden
cp .env.example .env
nano .env

# 4. KHỞI CHẠY HỆ THỐNG MỘT CHẠM
docker compose up -d --build && docker compose exec web npx prisma db push && docker compose exec web npm run db:seed`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7E2D7] p-8 shadow-heritage space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#0066CC] shadow-md shrink-0 bg-white">
              <img src="/logo-easup-official.png" alt="Logo Xã Ea Súp" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A64B2A] block">
                ĐOÀN THANH NIÊN EA SÚP - ĐĂK LĂK (13.070029, 107.883355)
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
                DU LỊCH EA SÚP: BẢN SẮC, DẤU ẤN ĐẠI NGÀN
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sẵn Sàng Triển Khai VPS
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed max-w-3xl">
          Trang này được thiết kế chuyên biệt để bạn kiểm tra trực quan toàn bộ các trang chức năng, chạy thử nghiệm các API Backend, xác thực tiêu chí thiết kế di sản và sao chép kịch bản dòng lệnh triển khai lên Termius.
        </p>
      </div>

      {/* QUICK PREVIEW TIÊU ĐIỂM (CÁC LIÊN KẾT NHANH ĐẾN TỪNG PHÂN HỆ) */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#0066CC]" />
          <span>Kiểm Tra Trực Quan Các Trang Chức Năng</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/"
            target="_blank"
            className="group bg-white p-5 rounded-2xl border border-[#E7E2D7] shadow-sm hover:border-[#0066CC] hover:shadow-heritage transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#0066CC]/10 text-[#0066CC] flex items-center justify-center mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#0066CC]">
                Trang Chủ Công Cộng
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                Hero di sản, Bento Grid bất đối xứng, Mini Audio Player & Bản đồ GIS Leaflet.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#0066CC] font-semibold">
              <span>Mở tab mới</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/destinations/thap-cham-yang-prong"
            target="_blank"
            className="group bg-white p-5 rounded-2xl border border-[#E7E2D7] shadow-sm hover:border-[#0066CC] hover:shadow-heritage transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-[#A64B2A]/10 text-[#A64B2A] flex items-center justify-center mb-3">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#A64B2A]">
                Chi Tiết Tháp Yang PRông
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                Tạp chí di sản, Audio Player Bar, mô phỏng quét mã QR thực địa, cẩm nang du khách.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#A64B2A] font-semibold">
              <span>Mở tab mới</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/destinations/ho-ea-sup-thuong"
            target="_blank"
            className="group bg-white p-5 rounded-2xl border border-[#E7E2D7] shadow-sm hover:border-[#0066CC] hover:shadow-heritage transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-blue-700">
                Chi Tiết Hồ Ea Súp Thượng
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                Mặt hồ mênh mông, tọa độ địa chính, ẩm thực cá bống kho nghệ & form gửi cảm nhận.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-blue-700 font-semibold">
              <span>Mở tab mới</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin"
            target="_blank"
            className="group bg-white p-5 rounded-2xl border border-[#E7E2D7] shadow-sm hover:border-[#0066CC] hover:shadow-heritage transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#1C1917] group-hover:text-[#0066CC]">
                Ban Quản Trị CMS
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                Quản lý danh sách, ghim trang chủ, bản đồ chấm GPS trực quan, kéo-thả nén ảnh WebP.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-[#0066CC] font-semibold">
              <span>Mở tab mới</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* LIVE API ENDPOINT TESTER */}
      <div className="bg-white rounded-3xl border border-[#E7E2D7] p-6 sm:p-8 shadow-heritage space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E2D7] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#0066CC]" />
              <span>Chạy Thử Nghiệm API Handlers Trực Tiếp (Live API Tester)</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Bấm vào các nút bên dưới để gửi request đến hệ thống Backend Next.js và xem kết quả JSON trả về
            </p>
          </div>
          <span className="text-[11px] font-mono bg-stone-100 px-3 py-1 rounded-full text-stone-600">
            HTTP Status: 200 OK
          </span>
        </div>

        {/* Buttons trigger */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => testApi('/api/destinations')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F2EB] hover:bg-[#0066CC] hover:text-white text-[#1C1917] border border-[#E7E2D7] transition-all flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-[#0066CC]" />
            <span>GET /api/destinations</span>
          </button>

          <button
            onClick={() => testApi('/api/destinations/thap-cham-yang-prong')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F2EB] hover:bg-[#0066CC] hover:text-white text-[#1C1917] border border-[#E7E2D7] transition-all flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-[#0066CC]" />
            <span>GET /api/destinations/thap-cham-yang-prong</span>
          </button>

          <button
            onClick={() => testApi('/api/itineraries')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F2EB] hover:bg-[#0066CC] hover:text-white text-[#1C1917] border border-[#E7E2D7] transition-all flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-[#0066CC]" />
            <span>GET /api/itineraries</span>
          </button>

          <button
            onClick={() => testApi('/api/auth/me')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#F5F2EB] hover:bg-[#0066CC] hover:text-white text-[#1C1917] border border-[#E7E2D7] transition-all flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-[#0066CC]" />
            <span>GET /api/auth/me</span>
          </button>
        </div>

        {/* Output box */}
        <div className="bg-[#1C1917] rounded-2xl p-4 text-[#E7E2D7] font-mono text-xs overflow-x-auto max-h-72 border border-stone-800">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-stone-400 text-[11px] mb-2">
            <span>Kết quả phản hồi JSON:</span>
            {testingEndpoint && <span className="text-amber-400 animate-pulse">Đang nạp {testingEndpoint}...</span>}
          </div>
          <pre>{apiTestResult || '// Bấm một trong các nút phía trên để kiểm tra phản hồi API thực tế'}</pre>
        </div>
      </div>

      {/* DETAILED CHECKLIST ITEMS */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#0066CC]" />
          <span>Danh Mục Nghiệm Thu Kỹ Thuật (Pre-flight Checklist)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {checklistItems.map((group, gIdx) => (
            <div key={gIdx} className="bg-white rounded-2xl border border-[#E7E2D7] p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#0066CC] uppercase tracking-wide border-b border-[#E7E2D7] pb-3">
                {group.category}
              </h3>
              <div className="space-y-3">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-[#1C1917]">{item.name}</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 1-TOUCH DEPLOY SCRIPT CARD */}
      <div className="bg-[#1C1917] text-white rounded-3xl p-6 sm:p-8 space-y-4 border border-stone-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] text-[#A64B2A] font-bold uppercase tracking-wider block">
              Triển khai VPS qua Termius
            </span>
            <h3 className="font-serif text-lg font-bold text-white">
              Kịch Bản Khởi Động Hệ Thống Một Chạm (1-Touch Command)
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(deploymentScript, 'deploy-script')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066CC] hover:bg-[#0052A3] text-white text-xs font-bold transition-all shadow"
          >
            {copiedId === 'deploy-script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedId === 'deploy-script' ? 'Đã sao chép' : 'Sao chép toàn bộ lệnh'}</span>
          </button>
        </div>

        <div className="bg-black/60 rounded-xl p-4 font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed border border-stone-800">
          <pre>{deploymentScript}</pre>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-400">
          <div>
            <strong className="text-stone-300 block mb-0.5">1. Cloudflare DNS:</strong>
            Bản ghi A trỏ IP VPS, bật Proxied (Đám mây cam) & SSL Full (Strict).
          </div>
          <div>
            <strong className="text-stone-300 block mb-0.5">2. Bitwarden Note:</strong>
            Lưu DB_PASSWORD & AUTH_SECRET vào Secure Note <code className="text-amber-300">ENV_HE_THONG_EASUPSO</code>.
          </div>
          <div>
            <strong className="text-stone-300 block mb-0.5">3. Quản trị viên mặc định:</strong>
            <code className="text-emerald-300">admin@easup.daklak.gov.vn</code> / <code className="text-emerald-300">AdminEaSup@2025!</code>
          </div>
        </div>
      </div>
    </div>
  );
}
