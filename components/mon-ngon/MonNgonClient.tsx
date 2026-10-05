'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Dices,
  Flame,
  Info,
  Lock,
  MapPin,
  Minus,
  Navigation,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Store,
  Trash2,
  Users,
  Utensils,
  UtensilsCrossed,
  X,
  XCircle,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_LABEL,
  DISHES,
  STORAGE_KEYS,
  TIME_SLOTS,
  buildSampleTables,
  formatTableTime,
  getTimeSlot,
  relativeDayLabel,
  type Dish,
  type DishCategory,
  type DishRestaurant,
  type FoodTable,
  type TimeSlot,
  DEFAULT_RESTAURANTS,
} from '@/lib/data/mon-ngon';
import { toast as sonnerToast } from 'sonner';
import { SEED_DISH_RESTAURANT } from '@/lib/account-sync';

type Tab = 'kham-pha' | 'quan-an' | 'ban-an' | 'lich-hen';

const dishById = (id: string) => DISHES.find((d) => d.id === id);

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeLS(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* bộ nhớ đầy hoặc chế độ riêng tư – bỏ qua */
  }
}

const mapsUrl = (t: FoodTable) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.restaurant.replace(/\s*\(mẫu\)/, '')}, ${t.address}`)}`;

/* ============================================================================
   COMPONENT CHÍNH
   ========================================================================== */
export default function MonNgonClient() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>('kham-pha');

  const { data: session } = useSession();
  const [customUser, setCustomUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('error') === 'EmailDaDangKyChuQuan') {
        sonnerToast.error(
          'Email này đã đăng ký làm chủ quán, không thể đăng ký/sử dụng với vai trò khách hàng. Vui lòng đăng nhập tại tab Chủ Quán!',
          { duration: 6000 }
        );
        window.history.replaceState({}, '', window.location.pathname);
      }

      const saved = localStorage.getItem('easup_auth_user');
      if (saved) {
        try {
          setCustomUser(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  const isLoggedIn = !!session?.user || !!customUser;

  // Khám phá
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DishCategory | 'all'>('all');
  const [allDishes, setAllDishes] = useState<Dish[]>(DISHES);

  const dishById = useCallback((id: string) => allDishes.find((d) => d.id === id) || DISHES.find((d) => d.id === id), [allDishes]);

  // Dữ liệu & Quán ăn
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [openRestaurantFor, setOpenRestaurantFor] = useState<string | null>(null);

  // Thông tin quán ăn phục vụ từng món (ưu tiên dữ liệu máy chủ gắn sẵn, dự phòng tra theo danh sách quán)
  const resolveRestaurant = useCallback(
    (d: Dish): DishRestaurant | null => {
      if (d.restaurant) return d.restaurant;
      const rid = d.restaurantId || SEED_DISH_RESTAURANT[d.id];
      const r = restaurants.find((x) => x.id === rid);
      if (r) {
        return {
          id: r.id,
          name: r.name,
          slug: r.slug,
          address: r.address,
          village: r.village,
          phone: r.phone || r.owner?.phone,
          openTime: r.openTime,
          closeTime: r.closeTime,
          coverImage: r.coverImage,
          ownerName: r.owner?.name || r.ownerName || null,
          isApproved: !!r.isApproved,
        };
      }
      if (rid) {
        const def = DEFAULT_RESTAURANTS.find((x) => x.id === rid);
        if (def) return def;
      }
      return null;
    },
    [restaurants]
  );

  // Bàn ăn
  const [dishFilter, setDishFilter] = useState<string>('all');
  const [slotFilter, setSlotFilter] = useState<TimeSlot>('all');

  // Dữ liệu bàn ăn
  const [sampleTables, setSampleTables] = useState<FoodTable[]>([]);
  const [myTables, setMyTables] = useState<FoodTable[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [cancelled, setCancelled] = useState<string[]>([]);
  const [nickname, setNickname] = useState('');

  // Modal & thông báo
  const [shakeOpen, setShakeOpen] = useState(false);
  const [createFor, setCreateFor] = useState<string | null>(null); // dishId hoặc '' = chưa chọn
  const [detail, setDetail] = useState<Dish | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const contentRef = useRef<HTMLDivElement>(null);

  /* ---------- Khởi tạo từ localStorage & API máy chủ ---------- */
  const fetchServerTables = useCallback(async () => {
    try {
      const res = await fetch('/api/food-tables');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setSampleTables(json.data);
      }
    } catch {
      // Dùng fallback sampleTables có sẵn
    }
  }, []);

  const fetchServerDishes = useCallback(async () => {
    try {
      const res = await fetch('/api/dishes');
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setAllDishes(json.data);
      }
    } catch {}
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurants');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRestaurants(json.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const n = new Date();
    setNow(n);
    setSampleTables(buildSampleTables(n));
    setMyTables(readLS<FoodTable[]>(STORAGE_KEYS.myTables, []));
    setJoined(readLS<string[]>(STORAGE_KEYS.joined, []));
    setCancelled(readLS<string[]>(STORAGE_KEYS.cancelled, []));
    setNickname(readLS<string>(STORAGE_KEYS.nickname, ''));
    setMounted(true);

    fetchServerTables();
    fetchServerDishes();
    fetchRestaurants();
    const timer = setInterval(() => {
      setNow(new Date());
      fetchServerTables();
      fetchServerDishes();
      fetchRestaurants();
    }, 60000);
    return () => clearInterval(timer);
  }, [fetchServerTables, fetchServerDishes, fetchRestaurants]);

  useEffect(() => { if (mounted) writeLS(STORAGE_KEYS.myTables, myTables); }, [myTables, mounted]);
  useEffect(() => { if (mounted) writeLS(STORAGE_KEYS.joined, joined); }, [joined, mounted]);
  useEffect(() => { if (mounted) writeLS(STORAGE_KEYS.cancelled, cancelled); }, [cancelled, mounted]);
  useEffect(() => { if (mounted) writeLS(STORAGE_KEYS.nickname, nickname); }, [nickname, mounted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const goTab = (t: Tab) => {
    setTab(t);
    requestAnimationFrame(() => {
      const el = contentRef.current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
    });
  };

  /* ---------- Tính toán bàn ăn ---------- */
  const allTables = useMemo(() => [...myTables, ...sampleTables], [myTables, sampleTables]);

  const countOf = useCallback(
    (t: FoodTable) => t.joined + (!t.mine && joined.includes(t.id) ? 1 : 0),
    [joined]
  );
  const isPast = useCallback(
    (t: FoodTable) => !!now && new Date(t.startAt).getTime() + t.durationMin * 60000 < now.getTime(),
    [now]
  );

  const openTables = useMemo(
    () =>
      allTables
        .filter((t) => !isPast(t) && !cancelled.includes(t.id))
        .filter((t) => dishFilter === 'all' || t.dishId === dishFilter)
        .filter((t) => slotFilter === 'all' || getTimeSlot(t.startAt) === slotFilter)
        .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt)),
    [allTables, isPast, cancelled, dishFilter, slotFilter]
  );

  const myAppointments = useMemo(
    () =>
      allTables
        .filter((t) => t.mine || joined.includes(t.id) || cancelled.includes(t.id))
        .sort((a, b) => {
          const ca = cancelled.includes(a.id) ? 1 : 0;
          const cb = cancelled.includes(b.id) ? 1 : 0;
          if (ca !== cb) return ca - cb;
          return +new Date(a.startAt) - +new Date(b.startAt);
        }),
    [allTables, joined, cancelled]
  );

  const activeTablesByDish = useMemo(() => {
    const m: Record<string, number> = {};
    allTables.forEach((t) => {
      if (!isPast(t) && !cancelled.includes(t.id)) m[t.dishId] = (m[t.dishId] || 0) + 1;
    });
    return m;
  }, [allTables, isPast, cancelled]);

  const filteredDishes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allDishes.filter((d) => category === 'all' || d.category === category).filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.shortDesc.toLowerCase().includes(q) ||
        (d.tags && d.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [allDishes, search, category]);

  /* ---------- Hành động ---------- */
  const joinTable = async (t: FoodTable) => {
    if (countOf(t) >= t.capacity) return showToast('Bàn đã đủ người, hãy chọn bàn khác nhé!');
    
    // Gọi API máy chủ để cập nhật số lượng cho tất cả mọi người
    try {
      fetch(`/api/food-tables/${t.id}/join`, { method: 'POST' }).then(() => fetchServerTables()).catch(() => {});
    } catch {}

    setJoined((j) => (j.includes(t.id) ? j : [...j, t.id]));
    setCancelled((c) => c.filter((id) => id !== t.id));
    showToast(`Đã tham gia bàn ${dishById(t.dishId)?.name ?? ''} 🎉`);
  };

  const cancelTable = async (t: FoodTable) => {
    if (t.mine) {
      if (!confirm('Hủy bàn này? Những người đã tham gia sẽ không còn thấy bàn.')) return;
      try {
        fetch(`/api/food-tables/${t.id}/cancel`, { method: 'POST' }).then(() => fetchServerTables()).catch(() => {});
      } catch {}
    }
    setJoined((j) => j.filter((id) => id !== t.id));
    setCancelled((c) => (c.includes(t.id) ? c : [...c, t.id]));
    showToast(t.mine ? 'Đã hủy bàn của bạn' : 'Đã rời bàn');
  };

  const removeHistory = (t: FoodTable) => {
    setCancelled((c) => c.filter((id) => id !== t.id));
    setJoined((j) => j.filter((id) => id !== t.id));
    if (t.mine) {
      setMyTables((m) => m.filter((x) => x.id !== t.id));
      try {
        fetch(`/api/food-tables/${t.id}`, { method: 'DELETE' }).catch(() => {});
      } catch {}
    }
    showToast('Đã xóa khỏi lịch hẹn');
  };

  const shareTable = async (t: FoodTable) => {
    const dish = dishById(t.dishId);
    const text = `🍽️ Rủ nhau đi ăn ${dish?.name} tại ${t.restaurant} – ${formatTableTime(t.startAt, t.durationMin)}. ${t.address}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Món ngon Ea Súp', text, url: location.href });
      else {
        await navigator.clipboard.writeText(`${text}\n${location.href}`);
        showToast('Đã sao chép lời mời vào bộ nhớ tạm');
      }
    } catch {
      /* người dùng đóng hộp chia sẻ */
    }
  };

  const createTable = async (data: Omit<FoodTable, 'id' | 'joined' | 'mine'>) => {
    try {
      const res = await fetch('/api/food-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const created: FoodTable = { ...json.data, mine: true };
        setMyTables((m) => [created, ...m]);
        setSampleTables((s) => [created, ...s]);
        setNickname(data.host);
        setCreateFor(null);
        goTab('lich-hen');
        showToast('Tạo bàn thành công! Chia sẻ để rủ thêm bạn nhé 🎉');
        return;
      }
    } catch (err) {
      console.warn('Lỗi kết nối máy chủ, lưu cục bộ:', err);
    }

    // Fallback lưu cục bộ nếu mạng bận
    const t: FoodTable = { ...data, id: `mine-${Date.now()}`, joined: 1, mine: true };
    setMyTables((m) => [t, ...m]);
    setNickname(data.host);
    setCreateFor(null);
    goTab('lich-hen');
    showToast('Tạo bàn thành công! Chia sẻ để rủ thêm bạn nhé 🎉');
  };

  const findTablesFor = (dishId: string) => {
    setDishFilter(dishId);
    setSlotFilter('all');
    setDetail(null);
    setShakeOpen(false);
    goTab('ban-an');
  };

  const upcomingMine = myAppointments.filter((t) => !cancelled.includes(t.id) && !isPast(t)).length;

  /* ======================================================================== */
  return (
    <div className="mn-page bg-gradient-to-b from-[#FFF8F3] via-[#FBF9F5] to-[#FBF9F5] pb-28 md:pb-16">
      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 md:pt-10">
        <div className="relative overflow-hidden rounded-[28px] bg-white/80 border border-[#F1E4D8] shadow-[0_20px_50px_-20px_rgba(217,69,43,0.25)] p-4 sm:p-6 lg:p-10">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FFD9C7]/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#FFEFC2]/60 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-6 lg:gap-10 items-center">
            {/* Bộ 3 ảnh */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 order-1 lg:order-2">
              {['/mon-ngon/ga-nuong.jpg', '/mon-ngon/com-lam.jpg', '/mon-ngon/xoai-cat.jpg'].map((src, i) => (
                <div
                  key={src}
                  className={`mn-fade-up overflow-hidden rounded-2xl shadow-md aspect-[4/5] ${i === 1 ? 'lg:translate-y-6' : ''}`}
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                </div>
              ))}
            </div>

            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1C9] text-[#7A4B00] px-3 py-1 text-xs sm:text-sm font-semibold">
                <Flame className="w-4 h-4 text-[#E8590C]" /> Chọn món · Hẹn tại quán
              </span>
              <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-black text-[#2B1D16] leading-[1.05]">
                Hôm nay <span className="text-[#D9452B]">thèm gì?</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-[#6B5B53] leading-relaxed max-w-xl">
                Chọn món bạn thèm, tìm bàn tại quán ngon ở Ea Súp và cùng ăn với những người yêu ẩm thực đại ngàn.
              </p>
              <div className="mt-5 flex items-center gap-2 sm:gap-3">
                <button
                  id="mn-btn-ru-nhau"
                  onClick={() => setCreateFor('')}
                  className="mn-press flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold text-xs sm:text-base px-3.5 sm:px-6 py-2.5 sm:py-3.5 whitespace-nowrap shadow-md sm:shadow-lg shadow-[#D9452B]/30 transition-colors"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>Rủ nhau đi</span>
                </button>
                <button
                  id="mn-btn-lac-mon"
                  onClick={() => setShakeOpen(true)}
                  className="mn-press group flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white border-2 border-[#EADBD0] hover:border-[#F5B82E] text-[#2B1D16] font-bold text-xs sm:text-base px-3.5 sm:px-6 py-2.5 sm:py-3.5 whitespace-nowrap transition-colors"
                >
                  <Dices className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Lắc món</span>
                </button>
              </div>

              {/* Thống kê nhanh */}
              <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 max-w-lg">
                {[
                  { n: DISHES.length, label: 'Món đặc sản' },
                  { n: mounted ? Object.values(activeTablesByDish).reduce((a, b) => a + b, 0) : '–', label: 'Bàn đang mở' },
                  { n: mounted ? upcomingMine : '–', label: 'Lịch hẹn của bạn' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-[#FFF8F3] border border-[#F3E6DB] px-3 py-2.5 text-center">
                    <div className="text-xl sm:text-2xl font-black text-[#D9452B]">{s.n}</div>
                    <div className="text-[11px] sm:text-xs text-[#7D6B62] font-medium leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TABS (desktop/tablet) ================= */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
        <div className="hidden md:flex items-center gap-1 p-1.5 rounded-full bg-[#F6EEE7] border border-[#EFE2D6] w-fit">
          {(
            [
              { id: 'kham-pha', label: 'Khám phá món', icon: Compass },
              { id: 'quan-an', label: `TÌM QUÁN ĂN/UỐNG (${restaurants.length})`, icon: Store },
              { id: 'ban-an', label: 'Bàn ăn/uống đang mở', icon: Utensils },
              { id: 'lich-hen', label: 'Lịch hẹn của tôi', icon: CalendarDays },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            
            // Màu sắc các nút:
            // - Khám phá món: nền xanh lá cây chữ trắng khi chưa chọn, khi chọn thì nền đỏ.
            // - TÌM QUÁN ĂN/UỐNG: nền xanh dương đậm #0066CC chữ trắng khi chưa chọn để tạo sự chú ý riêng, khi chọn thì nền đỏ.
            // - Các tab khác: chữ nâu, khi chọn thì chuyển sang nền màu đỏ.
            let buttonStyle = '';
            if (t.id === 'kham-pha') {
              buttonStyle = active
                ? 'bg-[#D9452B] text-white shadow-md font-bold'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-bold';
            } else if (t.id === 'quan-an') {
              buttonStyle = active
                ? 'bg-[#D9452B] text-white shadow-md font-bold'
                : 'bg-[#0066CC] hover:bg-[#0052A3] text-white shadow-xs font-bold';
            } else {
              buttonStyle = active
                ? 'bg-[#D9452B] text-white shadow-md font-bold'
                : 'text-[#6B5B53] hover:text-[#2B1D16] hover:bg-white/60 font-semibold';
            }

            return (
              <button
                key={t.id}
                id={`mn-tab-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-all ${buttonStyle}`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                {t.id === 'lich-hen' && mounted && upcomingMine > 0 && (
                  <span className={`ml-0.5 min-w-5 h-5 px-1.5 rounded-full text-[11px] grid place-items-center ${
                    active ? 'bg-white text-[#D9452B]' : 'bg-[#D9452B] text-white'
                  }`}>
                    {upcomingMine}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= NỘI DUNG ================= */}
        <div className="mt-5 md:mt-6">
          {/* Banner tiện ích: Khách đặt món & Chủ quán (Chỉ hiện khi đã đăng nhập) */}
          {isLoggedIn && (() => {
            const userRole = customUser?.role || (session?.user as any)?.role || 'TRAVELER';
            const isOwnerOrAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

            return (
              <div className={`gap-3 mb-6 ${isOwnerOrAdmin ? 'grid grid-cols-1 sm:grid-cols-2' : 'flex flex-col'}`}>
                {/* Banner Khách */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#EFF6FF] to-[#DBEAFE] border border-blue-200 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">
                        Lịch Sử Đặt Món & Đặt Bàn Của Bạn
                      </p>
                      <p className="text-[11px] sm:text-xs text-stone-600">
                        Theo dõi tiến độ đơn hàng và thông báo xác nhận từ quán.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/mon-ngon/lich-su-dat"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
                  >
                    <span>Xem đơn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Banner Chủ quán (Chỉ hiển thị cho Chủ Quán / Ban Quản Trị, ẩn hoàn toàn với Khách hàng) */}
                {isOwnerOrAdmin && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#FDEDE8] to-[#FFF6ED] border border-[#EADBD0] flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D9452B] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#2B1D16]">
                          Dành Cho Chủ Quán Ăn/Uống Ea Súp
                        </p>
                        <p className="text-[11px] sm:text-xs text-[#7D6B62]">
                          Đăng ký mở quán, quản lý món ăn/uống và tiếp nhận đơn đặt.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Link
                        href="/mon-ngon/dang-ky-chu-quan"
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-[#D9452B] hover:bg-[#BF3A22] text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Mở Quán</span>
                      </Link>
                      <Link
                        href="/chu-quan/dashboard"
                        className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-[#EADBD0] hover:border-[#D9452B] text-[#2B1D16] text-xs font-bold transition-all shadow-xs"
                      >
                        <span>Quản lý</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {tab === 'kham-pha' && (
            <section key="kp" className="mn-fade-up" aria-labelledby="mn-h-kham-pha">
              <h2 id="mn-h-kham-pha" className="text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                Khám phá món ngon
              </h2>
              <p className="text-sm sm:text-base text-[#7D6B62] mt-1">
                Đặc sản núi rừng, lòng hồ và nông sản OCOP của Ea Súp.
              </p>

              <div className="mt-4 flex gap-2.5">
                <label className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8968C]" />
                  <input
                    id="mn-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm món ăn..."
                    className="w-full rounded-full bg-white border border-[#EADBD0] pl-12 pr-10 py-3.5 text-[15px] outline-none focus:border-[#D9452B] focus:ring-4 focus:ring-[#D9452B]/10 transition"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      aria-label="Xóa tìm kiếm"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[#F6EEE7]"
                    >
                      <X className="w-4 h-4 text-[#7D6B62]" />
                    </button>
                  )}
                </label>
              </div>

              <div className="mt-3 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    id={`mn-cat-${c.id}`}
                    onClick={() => setCategory(c.id)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-all ${
                      category === c.id
                        ? 'bg-[#2B1D16] text-white border-[#2B1D16]'
                        : 'bg-white text-[#5A4A42] border-[#EADBD0] hover:border-[#D9452B]/50'
                    }`}
                  >
                    <span className="mr-1">{c.emoji}</span>
                    {c.label}
                  </button>
                ))}
              </div>

              {filteredDishes.length === 0 ? (
                <EmptyState
                  icon={Search}
                  title="Không tìm thấy món phù hợp"
                  desc="Thử từ khóa khác hoặc chọn “Tất cả”."
                  action={{ label: 'Xóa bộ lọc', onClick: () => { setSearch(''); setCategory('all'); } }}
                />
              ) : (
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                  {filteredDishes.map((d, i) => {
                    const n = activeTablesByDish[d.id] || 0;
                    return (
                      <article
                        key={d.id}
                        className="mn-fade-up group flex flex-col rounded-3xl bg-white border border-[#F1E4D8] overflow-hidden hover:shadow-[0_18px_40px_-18px_rgba(217,69,43,0.35)] hover:-translate-y-1 transition-all duration-300"
                        style={{ animationDelay: `${i * 45}ms` }}
                      >
                        <button onClick={() => setDetail(d)} className="relative aspect-[4/3] overflow-hidden text-left" aria-label={`Xem chi tiết ${d.name}`}>
                          <img src={d.image} alt={d.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] sm:text-xs font-bold text-[#2B1D16]">
                            {CATEGORY_LABEL[d.category]}
                          </span>
                        </button>
                        <div className="flex flex-col flex-1 p-3 sm:p-4">
                          <h3 className="font-sans text-base sm:text-lg font-bold text-[#2B1D16] leading-snug">{d.name}</h3>
                          <p className="mt-1 text-xs sm:text-sm text-[#7D6B62] line-clamp-2">{d.shortDesc}</p>
                          {(() => {
                            const rest = resolveRestaurant(d);
                            if (!rest) return null;
                            return (
                              <RestaurantInfo
                                restaurant={rest}
                                expanded={openRestaurantFor === d.id}
                                onToggle={() => setOpenRestaurantFor(openRestaurantFor === d.id ? null : d.id)}
                                idPrefix={`mn-rest-${d.id}`}
                              />
                            );
                          })()}
                          <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                            <span className={`text-xs sm:text-sm font-medium ${n ? 'text-[#2F9E44]' : 'text-[#A8968C]'}`}>
                              {mounted ? (n ? `${n} bàn đang mở` : 'Chưa có bàn') : '\u00A0'}
                            </span>
                          </div>
                          <button
                            onClick={() => (n ? findTablesFor(d.id) : setCreateFor(d.id))}
                            className="mt-2 self-end inline-flex items-center gap-1 text-sm font-bold text-[#D9452B] hover:gap-2 transition-all"
                          >
                            {n ? 'Tìm bàn ăn' : 'Mở bàn mới'} <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'quan-an' && (
            <section key="qa" className="mn-fade-up" aria-labelledby="mn-h-quan-an">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 id="mn-h-quan-an" className="text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                    Quán Ăn/Uống & Nhà Hàng Ea Súp
                  </h2>
                  <p className="text-sm sm:text-base text-[#7D6B62] mt-1">
                    Các địa điểm ẩm thực & giải khát uy tín đã được xác thực bởi Ban Quản Trị địa phương.
                  </p>
                </div>
              </div>

              {restaurants.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="Đang cập nhật danh sách quán ăn/uống"
                  desc="Hệ thống đang đồng bộ dữ liệu quán từ máy chủ. Vui lòng quay lại sau ít phút."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-5">
                  {restaurants.map((r, i) => (
                    <article
                      key={r.id}
                      className="mn-fade-up group flex flex-col rounded-3xl bg-white border border-[#F1E4D8] overflow-hidden hover:shadow-[0_20px_40px_-20px_rgba(217,69,43,0.3)] transition-all duration-300"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
                        <img
                          src={r.coverImage || '/mon-ngon/ga-nuong.jpg'}
                          alt={r.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                          <span className="rounded-full bg-emerald-600/90 backdrop-blur text-white px-2.5 py-1 text-[11px] font-bold">
                            Đã xác thực
                          </span>
                          {r.village && (
                            <span className="rounded-full bg-black/60 backdrop-blur text-white px-2.5 py-1 text-[11px] font-medium">
                              {r.village}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <h3 className="font-serif text-lg font-bold text-[#2B1D16] group-hover:text-[#D9452B] transition-colors">
                          {r.name}
                        </h3>

                        <div className="space-y-1.5 mt-2.5 text-xs text-[#7D6B62]">
                          <a
                            href={
                              r.lat && r.lng
                                ? `https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${r.name}, ${r.address}, Ea Súp, Đắk Lắk`
                                  )}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 hover:text-[#D9452B] transition-colors group cursor-pointer"
                            title="Mở Google Maps chỉ đường"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#D9452B] group-hover:scale-110 transition-transform shrink-0" />
                            <span className="line-clamp-1 group-hover:underline">{r.address}</span>
                          </a>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>Mở cửa: {r.openTime || '07:00'} - {r.closeTime || '22:00'}</span>
                          </div>
                          {r.phone && (
                            <div className="flex items-center gap-1.5 text-emerald-700 font-mono">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{r.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#F1E4D8] flex items-center justify-between">
                          <span className="text-xs text-[#7D6B62]">
                            Thực đơn: <strong className="text-[#2B1D16]">{r.menuItems?.length || 0} món</strong>
                          </span>
                          <Link
                            href={`/mon-ngon/${r.slug}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#FDEDE8] text-[#D9452B] hover:bg-[#D9452B] hover:text-white font-bold text-xs transition"
                          >
                            <span>Xem & Đặt</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'ban-an' && (
            <section key="ba" className="mn-fade-up" aria-labelledby="mn-h-ban-an">
              <h2 id="mn-h-ban-an" className="text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                Bàn bạn có thể tham gia
              </h2>
              <p className="text-sm sm:text-base text-[#7D6B62] mt-1">Bàn bắt đầu gần giờ bạn chọn, tại các quán quanh khu vực Ea Súp.</p>

              <div className="mt-4 grid sm:grid-cols-2 gap-0 sm:gap-3 rounded-3xl sm:rounded-none overflow-hidden sm:overflow-visible border sm:border-0 border-[#EADBD0] bg-white sm:bg-transparent divide-y sm:divide-y-0 divide-[#F1E4D8]">
                <FilterSelect
                  id="mn-filter-dish"
                  icon={UtensilsCrossed}
                  label="Món"
                  value={dishFilter}
                  onChange={setDishFilter}
                  options={[{ value: 'all', label: 'Món gì cũng được' }, ...DISHES.map((d) => ({ value: d.id, label: d.name }))]}
                />
                <FilterSelect
                  id="mn-filter-time"
                  icon={Clock}
                  label="Khi nào"
                  value={slotFilter}
                  onChange={(v) => setSlotFilter(v as TimeSlot)}
                  options={TIME_SLOTS.map((s) => ({ value: s.id, label: s.id === 'all' ? s.label : `${s.label} · ${s.range}` }))}
                />
              </div>

              {!mounted ? (
                <SkeletonList />
              ) : openTables.length === 0 ? (
                <EmptyState
                  icon={Utensils}
                  title="Chưa có bàn phù hợp"
                  desc="Hãy là người đầu tiên mở bàn và rủ mọi người cùng ăn!"
                  action={{ label: 'Mở bàn mới', onClick: () => setCreateFor(dishFilter === 'all' ? '' : dishFilter) }}
                />
              ) : (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {openTables.map((t, i) => {
                    const c = countOf(t);
                    const full = c >= t.capacity;
                    const isJoined = t.mine || joined.includes(t.id);
                    return (
                      <TableCard
                        key={t.id}
                        table={t}
                        count={c}
                        now={now}
                        delay={i * 50}
                        badge={
                          t.mine ? (
                            <Badge tone="blue" icon={Sparkles}>Bàn của bạn</Badge>
                          ) : full ? (
                            <Badge tone="neutral" icon={Lock}>Đã đủ người</Badge>
                          ) : isJoined ? (
                            <Badge tone="green" icon={Check}>Đã tham gia</Badge>
                          ) : (
                            <Badge tone="amber" icon={Flame}>Còn {t.capacity - c} chỗ</Badge>
                          )
                        }
                        footer={
                          isJoined ? (
                            <button onClick={() => goTab('lich-hen')} className="mn-press inline-flex items-center gap-1.5 rounded-full border-2 border-[#D9452B] text-[#D9452B] font-bold px-4 py-2.5 text-sm hover:bg-[#FDEDE8] transition-colors">
                              Xem lịch hẹn <ArrowRight className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled={full}
                              onClick={() => joinTable(t)}
                              className="mn-press inline-flex items-center gap-1.5 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] disabled:bg-[#D8CCC4] disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 text-sm shadow-md shadow-[#D9452B]/25 disabled:shadow-none transition-colors"
                            >
                              {full ? 'Đã đủ' : 'Tham gia'} {!full && <ArrowRight className="w-4 h-4" />}
                            </button>
                          )
                        }
                        onShare={() => shareTable(t)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {tab === 'lich-hen' && (
            <section key="lh" className="mn-fade-up" aria-labelledby="mn-h-lich-hen">
              <h2 id="mn-h-lich-hen" className="text-2xl sm:text-3xl font-bold text-[#2B1D16]">
                Lịch hẹn của tôi
              </h2>
              <p className="text-sm sm:text-base text-[#7D6B62] mt-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 shrink-0" /> Lịch hẹn được lưu ngay trên thiết bị này của bạn.
              </p>

              {!mounted ? (
                <SkeletonList />
              ) : myAppointments.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Bạn chưa có lịch hẹn nào"
                  desc="Tham gia một bàn có sẵn hoặc tự mở bàn để rủ bạn bè."
                  action={{ label: 'Xem bàn đang mở', onClick: () => goTab('ban-an') }}
                />
              ) : (
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  {myAppointments.map((t, i) => {
                    const c = countOf(t);
                    const isCancelled = cancelled.includes(t.id);
                    const past = isPast(t);
                    const full = c >= t.capacity;
                    return (
                      <TableCard
                        key={t.id}
                        table={t}
                        count={c}
                        now={now}
                        delay={i * 50}
                        muted={isCancelled || past}
                        badge={
                          isCancelled ? (
                            <Badge tone="red" icon={XCircle}>Đã hủy</Badge>
                          ) : past ? (
                            <Badge tone="neutral" icon={Check}>Đã kết thúc</Badge>
                          ) : full ? (
                            <Badge tone="neutral" icon={Lock}>Đã chốt danh sách</Badge>
                          ) : t.mine ? (
                            <Badge tone="blue" icon={Sparkles}>Bạn là chủ bàn</Badge>
                          ) : (
                            <Badge tone="green" icon={Check}>Sắp diễn ra</Badge>
                          )
                        }
                        footer={
                          isCancelled || past ? (
                            <div className="flex gap-2">
                              {isCancelled && !past && !t.mine && (
                                <button onClick={() => joinTable(t)} className="mn-press inline-flex items-center gap-1.5 rounded-full border-2 border-[#EADBD0] hover:border-[#D9452B] text-[#2B1D16] font-semibold px-3.5 py-2 text-sm transition-colors">
                                  <RotateCcw className="w-4 h-4" /> Tham gia lại
                                </button>
                              )}
                              <button onClick={() => removeHistory(t)} aria-label="Xóa khỏi lịch hẹn" className="mn-press inline-flex items-center gap-1.5 rounded-full bg-[#F6EEE7] hover:bg-[#EFE2D6] text-[#6B5B53] font-semibold px-3.5 py-2 text-sm transition-colors">
                                <Trash2 className="w-4 h-4" /> Xóa
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <a href={mapsUrl(t)} target="_blank" rel="noopener noreferrer" className="mn-press inline-flex items-center gap-1.5 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold px-4 py-2.5 text-sm shadow-md shadow-[#D9452B]/25 transition-colors">
                                <Navigation className="w-4 h-4" /> Chỉ đường
                              </a>
                              <button onClick={() => cancelTable(t)} className="mn-press inline-flex items-center gap-1 rounded-full border-2 border-[#EADBD0] hover:border-[#D9452B] hover:text-[#D9452B] text-[#6B5B53] font-semibold px-3.5 py-2 text-sm transition-colors">
                                {t.mine ? 'Hủy bàn' : 'Rời bàn'}
                              </button>
                            </div>
                          )
                        }
                        onShare={isCancelled || past ? undefined : () => shareTable(t)}
                      />
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setCreateFor('')}
                className="mn-press mt-6 w-full rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold py-4 shadow-lg shadow-[#D9452B]/25 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Mở bàn mới
              </button>
            </section>
          )}
        </div>
      </div>

      {/* ================= THANH ĐIỀU HƯỚNG DƯỚI (mobile) ================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#F1E4D8] pb-[env(safe-area-inset-bottom)]" aria-label="Điều hướng Món ngon">
        <div className="grid grid-cols-5 items-end h-16 px-2">
          <BottomItem icon={Compass} label="Khám phá" active={tab === 'kham-pha'} onClick={() => goTab('kham-pha')} />
          <BottomItem icon={Store} label="Quán ăn/uống" active={tab === 'quan-an'} onClick={() => goTab('quan-an')} />
          <div className="flex justify-center">
            <button
              id="mn-fab-create"
              onClick={() => setCreateFor('')}
              aria-label="Mở bàn mới"
              className="-translate-y-5 active:scale-95 transition-transform w-14 h-14 rounded-full bg-[#D9452B] text-white grid place-items-center shadow-xl shadow-[#D9452B]/40 ring-4 ring-white"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          <BottomItem icon={CalendarDays} label="Lịch hẹn" active={tab === 'lich-hen'} onClick={() => goTab('lich-hen')} badge={mounted ? upcomingMine : 0} />
          <BottomItem icon={Dices} label="Lắc món" active={false} onClick={() => setShakeOpen(true)} />
        </div>
      </nav>

      {/* ================= MODALS ================= */}
      {shakeOpen && (
        <ShakeModal
          allDishes={allDishes}
          resolveRestaurant={resolveRestaurant}
          onClose={() => setShakeOpen(false)}
          onFind={findTablesFor}
          onCreate={(id) => {
            setShakeOpen(false);
            setCreateFor(id);
          }}
          hasTables={(id) => !!activeTablesByDish[id]}
        />
      )}
      {detail && (
        <DishModal
          dish={detail}
          restaurant={resolveRestaurant(detail)}
          tables={activeTablesByDish[detail.id] || 0}
          onClose={() => setDetail(null)}
          onFind={() => findTablesFor(detail.id)}
          onCreate={() => {
            const id = detail.id;
            setDetail(null);
            setCreateFor(id);
          }}
        />
      )}
      {createFor !== null && (
        <CreateTableModal
          initialDish={createFor}
          nickname={session?.user?.name || customUser?.name || nickname}
          defaultPhone={(session?.user as any)?.phone || customUser?.phone || ''}
          allDishes={allDishes}
          restaurants={restaurants}
          resolveRestaurant={resolveRestaurant}
          onClose={() => setCreateFor(null)}
          onSubmit={createTable}
        />
      )}

      {/* Toast */}
      <div aria-live="polite" className="fixed left-1/2 -translate-x-1/2 bottom-24 md:bottom-8 z-[70] pointer-events-none">
        {toast && (
          <div className="mn-pop rounded-full bg-[#2B1D16] text-white text-sm font-medium px-5 py-3 shadow-2xl whitespace-nowrap">{toast}</div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   COMPONENT PHỤ
   ========================================================================== */

const BADGE_TONES = {
  red: 'bg-[#FDEDE8] text-[#C0392B]',
  green: 'bg-[#E9F7EE] text-[#2F7D45]',
  amber: 'bg-[#FFF3D6] text-[#9A5B00]',
  blue: 'bg-[#EBF5FF] text-[#0052A3]',
  neutral: 'bg-[#F3ECE5] text-[#5A4A42]',
};

function Badge({ tone, icon: Icon, children }: { tone: keyof typeof BADGE_TONES; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-[13px] font-bold ${BADGE_TONES[tone]}`}>
      <Icon className="w-3.5 h-3.5" /> {children}
    </span>
  );
}

function TableCard({
  table: t,
  count,
  now,
  badge,
  footer,
  muted,
  delay = 0,
  onShare,
}: {
  table: FoodTable;
  count: number;
  now: Date | null;
  badge: React.ReactNode;
  footer: React.ReactNode;
  muted?: boolean;
  delay?: number;
  onShare?: () => void;
}) {
  const dish = dishById(t.dishId);
  const seats = Math.min(t.capacity, 8);
  return (
    <article
      className={`mn-fade-up rounded-3xl bg-white border border-[#F1E4D8] overflow-hidden transition-all hover:shadow-[0_18px_40px_-20px_rgba(43,29,22,0.25)] ${muted ? 'opacity-75' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {badge}
          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#5A4A42]">
            <Clock className="w-4 h-4 text-[#D9452B]" />
            {now && <span className="text-[#D9452B]">{relativeDayLabel(t.startAt, now)} ·</span>}
            {formatTableTime(t.startAt, t.durationMin)}
          </span>
        </div>

        <div className="mt-3.5 flex gap-3.5">
          <img src={dish?.image} alt={dish?.name} className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0 ${muted ? 'grayscale-[40%]' : ''}`} />
          <div className="min-w-0">
            <h3 className="font-sans text-lg sm:text-xl font-bold text-[#2B1D16] leading-tight">{dish?.name}</h3>
            <p className="mt-1.5 flex items-start gap-1.5 text-sm sm:text-[15px] text-[#3D2E27] font-medium">
              <Store className="w-4 h-4 mt-0.5 text-[#D9452B] shrink-0" /> {t.restaurant}
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-xs sm:text-sm text-[#7D6B62]">
              <MapPin className="w-4 h-4 mt-px shrink-0" /> {t.address}
            </p>
            {t.note && <p className="mt-1.5 text-xs sm:text-sm text-[#6B5B53] italic line-clamp-2">“{t.note}”</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-[#FFF8F3] border-t border-[#F6EAE0] px-4 sm:px-5 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#2B1D16]">
              {count}/{t.capacity} chỗ
            </span>
            <div className="flex -space-x-1">
              {Array.from({ length: seats }).map((_, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full grid place-items-center ring-2 ring-[#FFF8F3] ${
                    i < count ? 'bg-[#D9452B] text-white' : 'bg-white border border-dashed border-[#D8CCC4]'
                  }`}
                >
                  {i < count && <UtensilsCrossed className="w-2.5 h-2.5" />}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#7D6B62]">
            <Users className="w-3.5 h-3.5" /> Chủ bàn: <b className="text-[#3D2E27] truncate">{t.host}</b>
            {onShare && (
              <button onClick={onShare} aria-label="Chia sẻ bàn" className="ml-1 p-1 rounded-full hover:bg-[#F6EEE7] text-[#D9452B]">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="shrink-0">{footer}</div>
      </div>
    </article>
  );
}

function FilterSelect({
  id,
  icon: Icon,
  label,
  value,
  onChange,
  options,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const current = options.find((o) => o.value === value)?.label;
  return (
    <label htmlFor={id} className="relative flex items-center gap-3 bg-white sm:rounded-2xl sm:border border-[#EADBD0] px-4 py-3 cursor-pointer hover:bg-[#FFFBF8] transition-colors">
      <span className="w-10 h-10 rounded-full bg-[#FDEDE8] grid place-items-center shrink-0">
        <Icon className="w-5 h-5 text-[#D9452B]" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs text-[#7D6B62]">{label}</span>
        <span className="block font-bold text-[#2B1D16] truncate">{current}</span>
      </span>
      <ChevronDown className="w-5 h-5 text-[#7D6B62]" />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" aria-label={label}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BottomItem({ icon: Icon, label, active, onClick, badge = 0 }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center gap-0.5 h-full text-[11px] font-semibold transition-colors ${active ? 'text-[#D9452B]' : 'text-[#7D6B62]'}`}>
      {active && <span className="absolute top-0 w-8 h-1 rounded-b-full bg-[#D9452B]" />}
      <span className={`relative px-3 py-1 rounded-full ${active ? 'bg-[#FDEDE8]' : ''}`}>
        <Icon className="w-5 h-5" />
        {badge > 0 && (
          <span className="absolute -top-1 right-0.5 min-w-4 h-4 px-1 rounded-full bg-[#D9452B] text-white text-[10px] grid place-items-center">{badge}</span>
        )}
      </span>
      {label}
    </button>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: { icon: React.ElementType; title: string; desc: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="mt-6 rounded-3xl border-2 border-dashed border-[#EADBD0] bg-white/60 px-6 py-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-[#FDEDE8] grid place-items-center">
        <Icon className="w-7 h-7 text-[#D9452B]" />
      </div>
      <h3 className="font-sans mt-4 text-lg font-bold text-[#2B1D16]">{title}</h3>
      <p className="mt-1 text-sm text-[#7D6B62]">{desc}</p>
      {action && (
        <button onClick={action.onClick} className="mn-press mt-5 inline-flex items-center gap-2 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold px-6 py-3 transition-colors">
          <Plus className="w-4 h-4" /> {action.label}
        </button>
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="mt-4 grid md:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-3xl bg-white border border-[#F1E4D8] p-5 animate-pulse">
          <div className="h-6 w-32 rounded-full bg-[#F3ECE5]" />
          <div className="mt-4 flex gap-3">
            <div className="w-24 h-24 rounded-2xl bg-[#F3ECE5]" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-2/3 rounded bg-[#F3ECE5]" />
              <div className="h-4 w-full rounded bg-[#F3ECE5]" />
              <div className="h-4 w-1/2 rounded bg-[#F3ECE5]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Khung modal dùng chung ---------- */
function ModalShell({ onClose, children, labelledBy, wide }: { onClose: () => void; children: React.ReactNode; labelledBy: string; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="absolute inset-0 bg-[#2B1D16]/50 backdrop-blur-sm mn-fade" onClick={onClose} />
      <div className={`mn-sheet relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'} max-h-[92vh] overflow-y-auto bg-white rounded-t-[28px] sm:rounded-[28px] shadow-2xl`}>
        <button onClick={onClose} aria-label="Đóng" className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur grid place-items-center shadow hover:bg-[#F6EEE7]">
          <X className="w-5 h-5 text-[#2B1D16]" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ---------- Lắc món ---------- */
function ShakeModal({
  allDishes = DISHES,
  resolveRestaurant,
  onClose,
  onFind,
  onCreate,
  hasTables,
}: {
  allDishes?: Dish[];
  resolveRestaurant?: (d: Dish) => DishRestaurant | null;
  onClose: () => void;
  onFind: (id: string) => void;
  onCreate: (id: string) => void;
  hasTables: (id: string) => boolean;
}) {
  const pool = allDishes && allDishes.length > 0 ? allDishes : DISHES;
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * pool.length));
  const [rolling, setRolling] = useState(false);
  const [rolls, setRolls] = useState(0);

  const roll = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    let step = 0;
    const total = 14 + Math.floor(Math.random() * 6);
    const tick = () => {
      step++;
      setIdx((i) => (i + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length);
      if (step < total) setTimeout(tick, 50 + step * 12);
      else {
        setRolling(false);
        setRolls((r) => r + 1);
      }
    };
    tick();
  }, [rolling, pool.length]);

  useEffect(() => {
    roll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const d = pool[idx];
  const r = resolveRestaurant ? resolveRestaurant(d) : (d.restaurant || null);

  return (
    <ModalShell onClose={onClose} labelledBy="mn-shake-title">
      <div className="p-6 pt-7 text-center">
        <div className={`mx-auto w-14 h-14 rounded-2xl bg-[#F5B82E] grid place-items-center shadow-lg shadow-[#F5B82E]/40 ${rolling ? 'mn-shake' : ''}`}>
          <Dices className="w-7 h-7 text-[#2B1D16]" />
        </div>
        <h2 id="mn-shake-title" className="mt-3 text-2xl font-bold text-[#2B1D16]">
          {rolling ? 'Đang lắc món…' : 'Hôm nay ăn món này nhé!'}
        </h2>
        <div className={`mt-5 rounded-3xl overflow-hidden border border-[#F1E4D8] bg-white text-left ${rolling ? '' : 'mn-pop'}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <img src={d.image} alt={d.name} className={`w-full h-full object-cover transition ${rolling ? 'blur-[2px] scale-105' : ''}`} />
          </div>
          <div className="p-4">
            <span className="text-xs font-bold text-[#D9452B] uppercase tracking-wide">{CATEGORY_LABEL[d.category]}</span>
            <h3 className="font-sans text-xl font-bold text-[#2B1D16]">{d.name}</h3>
            <p className="mt-1 text-sm text-[#7D6B62] leading-relaxed">{d.shortDesc}</p>

            {/* Thông tin Quán ăn phục vụ món đã lắc trúng */}
            {r && !rolling && (
              <div className="mt-3 pt-3 border-t border-[#F1E4D8] bg-[#FFF8F3] -mx-4 -mb-4 p-3.5 space-y-1.5 text-xs text-[#2B1D16]">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-[#D9452B] flex items-center gap-1.5 truncate">
                    <Store className="w-3.5 h-3.5 shrink-0 text-[#D9452B]" />
                    <span className="truncate">{r.name}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    Đã xác thực
                  </span>
                </div>
                {r.ownerName && (
                  <p className="text-stone-600">
                    <span className="font-semibold text-stone-700">Chủ quán:</span> {r.ownerName}
                  </p>
                )}
                <p className="text-stone-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D9452B] shrink-0 mt-0.5" />
                  <span className="truncate">{r.address}</span>
                </p>
                <div className="flex items-center justify-between gap-2 pt-0.5 text-[11px] text-stone-600">
                  {r.phone && (
                    <span className="flex items-center gap-1 font-bold text-emerald-700">
                      <Phone className="w-3 h-3 text-emerald-600" /> {r.phone}
                    </span>
                  )}
                  {(r.openTime || r.closeTime) && (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <Clock className="w-3 h-3" /> {r.openTime || '07:30'} – {r.closeTime || '22:00'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={roll}
            disabled={rolling}
            className="mn-press inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#EADBD0] hover:border-[#F5B82E] font-bold py-3 disabled:opacity-60 transition-colors"
          >
            <RotateCcw className={`w-4 h-4 ${rolling ? 'animate-spin' : ''}`} /> Lắc lại
          </button>
          <button
            disabled={rolling}
            onClick={() => onCreate(d.id)}
            className="mn-press inline-flex items-center justify-center gap-2 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold py-3 disabled:opacity-60 transition-colors shadow-lg shadow-[#D9452B]/30"
          >
            Mở bàn <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {hasTables(d.id) && !rolling && (
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => onFind(d.id)}
              className="text-xs font-semibold text-[#0066CC] hover:underline"
            >
              Hoặc xem các bàn ăn đang mở cho món này →
            </button>
          </div>
        )}

        {rolls > 2 && !rolling && <p className="mt-2 text-xs text-[#A8968C]">Lắc {rolls} lần rồi đó, chốt món này luôn thôi! 😄</p>}
      </div>
    </ModalShell>
  );
}

/* ---------- Khối thông tin quán ăn phục vụ món (Hiển thị trên thẻ món) ---------- */
function RestaurantInfo({
  restaurant,
  expanded,
  onToggle,
  idPrefix,
}: {
  restaurant: DishRestaurant;
  expanded: boolean;
  onToggle: () => void;
  idPrefix: string;
}) {
  return (
    <div className="mt-2.5 rounded-2xl bg-[#FFF8F3] border border-[#F3E6DB] p-2.5 sm:p-3 text-left">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#D9452B] flex items-center gap-1 truncate">
            <Store className="w-3.5 h-3.5 shrink-0 text-[#D9452B]" />
            <span className="truncate">{restaurant.name}</span>
          </p>
          <a
            href={
              restaurant.lat && restaurant.lng
                ? `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${restaurant.name}, ${restaurant.address}, Ea Súp, Đắk Lắk`
                  )}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-[#7D6B62] hover:text-[#D9452B] flex items-center gap-1 mt-0.5 truncate group cursor-pointer"
            title="Mở Google Maps chỉ đường"
          >
            <MapPin className="w-3 h-3 shrink-0 text-[#D9452B] group-hover:scale-110 transition-transform" />
            <span className="truncate group-hover:underline">{restaurant.address}</span>
          </a>
        </div>
        <button
          type="button"
          id={`${idPrefix}-toggle`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-[#EADBD0] text-[#D9452B] hover:bg-[#FDEDE8] transition-colors"
        >
          {expanded ? 'Thu gọn' : 'Xem quán'}
        </button>
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-[#F1E4D8] space-y-1.5 text-[11px] text-[#4A3B34] animate-in fade-in duration-200">
          {restaurant.ownerName && (
            <p className="flex items-center gap-1.5">
              <span className="text-[#A8968C]">Chủ quán:</span>
              <span className="font-semibold text-[#2B1D16]">{restaurant.ownerName}</span>
            </p>
          )}
          {restaurant.phone && (
            <p className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#D9452B]" />
              <a
                href={`tel:${restaurant.phone}`}
                className="font-bold text-[#0066CC] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {restaurant.phone}
              </a>
            </p>
          )}
          {(restaurant.openTime || restaurant.closeTime) && (
            <p className="flex items-center gap-1.5 text-stone-600">
              <Clock className="w-3 h-3 text-[#F5B82E]" />
              <span>Phục vụ: {restaurant.openTime || '07:30'} – {restaurant.closeTime || '22:00'}</span>
            </p>
          )}
          <div className="pt-1 flex items-center justify-end">
            <Link
              href={`/mon-ngon/${restaurant.slug || restaurant.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D9452B] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Xem trang quán & thực đơn</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Chi tiết món ---------- */
function DishModal({
  dish,
  restaurant,
  tables,
  onClose,
  onFind,
  onCreate,
}: {
  dish: Dish;
  restaurant?: DishRestaurant | null;
  tables: number;
  onClose: () => void;
  onFind: () => void;
  onCreate: () => void;
}) {
  return (
    <ModalShell onClose={onClose} labelledBy="mn-dish-title">
      <div className="aspect-[16/10] overflow-hidden">
        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
      </div>
      <div className="p-5 sm:p-6">
        <span className="inline-block rounded-full bg-[#FDEDE8] text-[#C0392B] px-3 py-1 text-xs font-bold">{CATEGORY_LABEL[dish.category]}</span>
        <h2 id="mn-dish-title" className="mt-2 text-2xl sm:text-3xl font-bold text-[#2B1D16]">{dish.name}</h2>
        <p className="mt-3 text-[15px] text-[#4A3B34] leading-relaxed">{dish.story}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {dish.tags.map((t) => (
            <span key={t} className="rounded-full bg-[#F6EEE7] text-[#5A4A42] px-3 py-1 text-xs font-semibold">#{t}</span>
          ))}
        </div>
        <div className="mt-4 rounded-2xl bg-[#FFF8F3] border border-[#F3E6DB] px-4 py-3 text-sm">
          <span className="text-[#7D6B62]">Giá tham khảo: </span>
          <b className="text-[#2B1D16]">{dish.priceRange}</b>
        </div>

        {/* Thông tin Quán ăn & Chủ quán phục vụ món */}
        {restaurant && (
          <div className="mt-4 rounded-2xl bg-[#FFF8F3] border-2 border-[#F3E6DB] p-4 text-left">
            <div className="flex items-center justify-between pb-2 border-b border-[#F1E4D8]">
              <span className="text-xs font-bold text-[#D9452B] flex items-center gap-1.5 uppercase tracking-wide">
                <Store className="w-4 h-4 text-[#D9452B]" />
                <span>Quán ăn phục vụ món này</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Đã xác thực
              </span>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs text-[#2B1D16]">
              <p className="text-base font-bold text-[#2B1D16]">{restaurant.name}</p>
              {restaurant.ownerName && (
                <p className="text-stone-600">
                  <span className="font-semibold text-stone-700">Chủ quán:</span> {restaurant.ownerName}
                </p>
              )}
              <p className="flex items-start gap-1.5 text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-[#D9452B] shrink-0 mt-0.5" />
                <span>{restaurant.address}</span>
              </p>
              {(restaurant.openTime || restaurant.closeTime) && (
                <p className="flex items-center gap-1.5 text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Giờ mở cửa: <strong>{restaurant.openTime || '07:30'} – {restaurant.closeTime || '22:00'}</strong></span>
                </p>
              )}
              {restaurant.phone && (
                <div className="pt-2 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi {restaurant.phone}</span>
                  </a>
                  <Link
                    href={`/mon-ngon/${restaurant.slug || restaurant.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#D9452B] hover:underline"
                  >
                    <span>Xem thực đơn quán</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onCreate} className="mn-press inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#EADBD0] hover:border-[#D9452B] font-bold py-3 transition-colors">
            <Plus className="w-4 h-4" /> Mở bàn
          </button>
          <button onClick={onFind} disabled={!tables} className="mn-press inline-flex items-center justify-center gap-2 rounded-full bg-[#D9452B] hover:bg-[#BF3A22] disabled:bg-[#D8CCC4] text-white font-bold py-3 transition-colors">
            {tables ? `${tables} bàn đang mở` : 'Chưa có bàn'} {tables > 0 && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ---------- Tạo bàn mới ---------- */
function CreateTableModal({
  initialDish,
  nickname,
  defaultPhone = '',
  allDishes = DISHES,
  restaurants = [],
  resolveRestaurant,
  onClose,
  onSubmit,
}: {
  initialDish: string;
  nickname: string;
  defaultPhone?: string;
  allDishes?: Dish[];
  restaurants?: any[];
  resolveRestaurant?: (d: Dish) => DishRestaurant | null;
  onClose: () => void;
  onSubmit: (t: Omit<FoodTable, 'id' | 'joined' | 'mine'>) => void;
}) {
  const defaults = useMemo(() => {
    const d = new Date(Date.now() + 2 * 3600000);
    d.setMinutes(d.getMinutes() < 30 ? 30 : 60, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  }, []);

  // Hàm tra cứu thông tin quán ăn phục vụ món
  const getDishRes = useCallback(
    (dishObj: Dish | undefined): DishRestaurant | null => {
      if (!dishObj) return null;
      if (resolveRestaurant) {
        const r = resolveRestaurant(dishObj);
        if (r) return r;
      }
      if (dishObj.restaurant) return dishObj.restaurant;
      const rid = dishObj.restaurantId || SEED_DISH_RESTAURANT[dishObj.id];
      if (rid) {
        const found = restaurants.find((x) => x.id === rid);
        if (found) {
          return {
            id: found.id,
            name: found.name,
            slug: found.slug,
            address: found.address,
            village: found.village,
            phone: found.phone || found.owner?.phone,
            openTime: found.openTime,
            closeTime: found.closeTime,
            coverImage: found.coverImage,
            ownerName: found.owner?.name || found.ownerName || null,
            isApproved: !!found.isApproved,
          };
        }
        const def = DEFAULT_RESTAURANTS.find((x) => x.id === rid);
        if (def) return def;
      }
      return null;
    },
    [resolveRestaurant, restaurants]
  );

  // Danh sách các quán ẩm thực tại Ea Súp để hiển thị phía trên
  const approvedRestaurantsList = useMemo(() => {
    const list: DishRestaurant[] = [];
    const seen = new Set<string>();

    for (const r of restaurants) {
      if (r.id && !seen.has(r.id)) {
        seen.add(r.id);
        list.push({
          id: r.id,
          name: r.name,
          slug: r.slug,
          address: r.address,
          village: r.village,
          phone: r.phone || r.owner?.phone,
          openTime: r.openTime,
          closeTime: r.closeTime,
          coverImage: r.coverImage,
          ownerName: r.owner?.name || r.ownerName || null,
          isApproved: !!r.isApproved,
        });
      }
    }

    for (const def of DEFAULT_RESTAURANTS) {
      if (!seen.has(def.id)) {
        seen.add(def.id);
        list.push(def);
      }
    }
    return list;
  }, [restaurants]);

  // Cho phép chọn nhiều món ăn (mặc định chọn món ban đầu nếu có)
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>(() => {
    return initialDish ? [initialDish] : [];
  });

  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [duration, setDuration] = useState(90);
  const [capacity, setCapacity] = useState(4);
  const [host, setHost] = useState(nickname);
  const [phone, setPhone] = useState(defaultPhone);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Đếm số lượng món của quán đang được chọn
  const getSelectedCountForRestaurant = useCallback(
    (resId: string, resName: string) => {
      return selectedDishIds.filter((id) => {
        const dish = allDishes.find((x) => x.id === id) || DISHES.find((x) => x.id === id);
        const r = getDishRes(dish);
        return r && (r.id === resId || r.name.toLowerCase() === resName.toLowerCase());
      }).length;
    },
    [selectedDishIds, allDishes, getDishRes]
  );

  // Danh sách các quán có món được chọn
  const activeRestaurants = useMemo(() => {
    return approvedRestaurantsList.filter((r) => getSelectedCountForRestaurant(r.id, r.name) > 0);
  }, [approvedRestaurantsList, getSelectedCountForRestaurant]);

  // Cảnh báo nếu chọn món ở 2 quán ăn trở lên
  const isMultiRestaurantWarning = activeRestaurants.length >= 2;

  // Quán ăn chính đại diện cho bàn (quán có nhiều món nhất hoặc quán đầu tiên)
  const primaryRestaurant = useMemo(() => {
    if (activeRestaurants.length === 0) return approvedRestaurantsList[0] || null;
    let best = activeRestaurants[0];
    let maxCount = getSelectedCountForRestaurant(best.id, best.name);
    for (const r of activeRestaurants) {
      const c = getSelectedCountForRestaurant(r.id, r.name);
      if (c > maxCount) {
        best = r;
        maxCount = c;
      }
    }
    return best;
  }, [activeRestaurants, approvedRestaurantsList, getSelectedCountForRestaurant]);

  // Toggle chọn hoặc bỏ chọn một món ăn
  const toggleDish = (dish: Dish) => {
    setError(null);
    setSelectedDishIds((prev) => {
      if (prev.includes(dish.id)) {
        return prev.filter((id) => id !== dish.id);
      } else {
        return [...prev, dish.id];
      }
    });
  };

  // Nút khắc phục nhanh: chỉ giữ lại các món của 1 quán duy nhất
  const keepOnlyDishesForRestaurant = (resId: string, resName: string) => {
    setError(null);
    setSelectedDishIds((prev) => {
      return prev.filter((id) => {
        const dish = allDishes.find((x) => x.id === id) || DISHES.find((x) => x.id === id);
        const r = getDishRes(dish);
        return r && (r.id === resId || r.name.toLowerCase() === resName.toLowerCase());
      });
    });
  };

  // Chọn toàn bộ món của một quán khi bấm vào quán
  const selectAllDishesOfRestaurant = (resId: string, resName: string) => {
    setError(null);
    const dishesOfRes = allDishes.filter((d) => {
      const r = getDishRes(d);
      return r && (r.id === resId || r.name.toLowerCase() === resName.toLowerCase());
    });
    if (dishesOfRes.length > 0) {
      // Nếu đã có món của quán này thì toggle hoặc giữ nguyên, nếu chưa có thì chọn món đầu tiên
      const alreadyHas = dishesOfRes.some((d) => selectedDishIds.includes(d.id));
      if (!alreadyHas) {
        setSelectedDishIds((prev) => [...prev, dishesOfRes[0].id]);
      }
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDishIds.length === 0) return setError('Hãy chọn ít nhất một món ăn bạn muốn đặt.');
    if (!host.trim()) return setError('Hãy nhập họ tên của bạn để chủ bàn tiếp đón.');
    const start = new Date(`${date}T${time}`);
    if (isNaN(start.getTime())) return setError('Thời gian không hợp lệ.');
    if (start.getTime() < Date.now() - 5 * 60000) return setError('Thời gian hẹn phải ở tương lai.');

    const targetRes = primaryRestaurant || approvedRestaurantsList[0];
    const targetDishId = selectedDishIds[0];

    let fullNote = note.trim();
    if (phone.trim()) {
      fullNote = `SĐT liên hệ: ${phone.trim()}${fullNote ? ` | ${fullNote}` : ''}`;
    }
    const dishesNote = selectedDishIds.length > 0
      ? `Món đã chọn: ${selectedDishIds.map((id) => allDishes.find((d) => d.id === id)?.name || id).join(', ')}`
      : '';
    if (dishesNote) {
      fullNote = fullNote ? `${fullNote} (${dishesNote})` : dishesNote;
    }

    const hostDisplay = phone.trim() ? `${host.trim()} (${phone.trim()})` : host.trim();

    onSubmit({
      dishId: targetDishId,
      restaurant: targetRes?.name || 'Quán ăn Ea Súp',
      address: targetRes?.address || 'Xã Ea Súp, Đắk Lắk',
      startAt: start.toISOString(),
      durationMin: duration,
      capacity,
      host: hostDisplay,
      note: fullNote || undefined,
    });
  };

  const inputCls =
    'w-full rounded-2xl bg-[#FFFBF8] border border-[#EADBD0] px-4 py-3 text-[15px] outline-none focus:border-[#D9452B] focus:ring-4 focus:ring-[#D9452B]/10 transition';

  return (
    <ModalShell onClose={onClose} labelledBy="mn-create-title" wide>
      <form onSubmit={submit} className="p-5 sm:p-7">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF1C9] text-[#7A4B00] px-3 py-1 text-xs font-semibold">
            <Users className="w-3.5 h-3.5" /> Rủ nhau đi ăn
          </span>
          <span className="text-[11px] font-semibold text-[#7A4B00] bg-[#FFF1C9] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3 text-[#D9452B]" /> Mở bàn tại quán
          </span>
        </div>
        <h2 id="mn-create-title" className="mt-2 text-2xl sm:text-3xl font-bold text-[#2B1D16]">Mở bàn mới</h2>

        {/* ================= 1. QUÁN ĂN PHỤC VỤ (DẠNG LIST, CHỈ HIỆN KHI CÓ KHÁCH CHỌN MÓN) ================= */}
        {activeRestaurants.length > 0 && (
          <fieldset className="mt-5">
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <legend className="text-sm font-bold text-[#2B1D16] flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#D9452B]" />
                <span>Quán ăn tại Ea Súp</span>
              </legend>
              <span className="text-xs text-[#7D6B62]">
                Quán phục vụ món bạn đã chọn
              </span>
            </div>

            <div className="space-y-2">
              {activeRestaurants.map((r) => {
                const count = getSelectedCountForRestaurant(r.id, r.name);
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-[#D9452B] text-white border border-[#BF3A22] shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Store className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                          {r.name}
                        </p>
                        <p className="text-[11px] text-white/80 truncate flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0 text-white/70" />
                          <span className="truncate">{r.address}</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#D9452B] shadow-2xs">
                        {count} món
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* ================= NHẮC NHỞ KHI CHỌN MÓN Ở 2 QUÁN ĂN TRỞ LÊN ================= */}
        {isMultiRestaurantWarning && (
          <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 p-3.5 sm:p-4 text-amber-950 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D9452B] shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-[#D9452B]">
                    ⚠️ Nhắc nhở: Bạn đang chọn món ở {activeRestaurants.length} quán ăn khác nhau!
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Tránh chọn nhầm
                  </span>
                </div>
                <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                  Bàn ăn của bạn đang chọn món của: <strong>{activeRestaurants.map((r) => r.name).join('</strong> và <strong>')}</strong>.
                  Mỗi bàn ăn nên mở tại <strong>1 quán duy nhất</strong> để quán chuẩn bị phục vụ chu đáo nhất và bạn không phải di chuyển giữa các nơi.
                </p>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-stone-800">Khắc phục nhanh:</span>
                  {activeRestaurants.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => keepOnlyDishesForRestaurant(res.id, res.name)}
                      className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-[#D9452B] text-[#D9452B] hover:bg-[#FDEDE8] transition-colors shadow-2xs inline-flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Chỉ đặt món tại {res.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. CHỌN MÓN ĂN (CHỌN NHIỀU MÓN) ================= */}
        <fieldset className="mt-5">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <legend className="text-sm font-bold text-[#2B1D16] flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#D9452B]" />
              <span>Chọn món ăn</span>
              {selectedDishIds.length > 0 && (
                <span className="text-xs font-bold text-[#D9452B] bg-[#FDEDE8] px-2.5 py-0.5 rounded-full">
                  Đã chọn {selectedDishIds.length} món
                </span>
              )}
            </legend>
            <span className="text-xs text-[#7D6B62]">
              (Có thể bấm chọn nhiều món ăn cho bàn)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {allDishes.map((d) => {
              const active = selectedDishIds.includes(d.id);
              const r = getDishRes(d);
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => toggleDish(d)}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all text-left bg-white shadow-xs group ${
                    active
                      ? 'border-[#D9452B] ring-4 ring-[#D9452B]/15'
                      : 'border-[#F1E4D8] hover:border-[#D9452B]/60'
                  }`}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 relative">
                    <img
                      src={d.image}
                      alt={d.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {active && (
                      <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#D9452B] text-white text-xs font-bold grid place-items-center shadow-md animate-in zoom-in-50">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {r && (
                      <span
                        className={`absolute bottom-1 left-1 max-w-[90%] truncate rounded-md text-[9px] font-semibold px-1.5 py-0.5 ${
                          active ? 'bg-[#D9452B] text-white' : 'bg-black/65 text-white backdrop-blur-xs'
                        }`}
                      >
                        {r.name}
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-[#2B1D16] line-clamp-1">{d.name}</p>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <p className="text-[10px] text-[#D9452B] font-semibold">{d.priceRange}</p>
                      {active && (
                        <span className="text-[10px] font-bold text-[#D9452B]">✓ Đã chọn</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ================= 3. THÔNG TIN QUÁN & THỜI GIAN HẸN ================= */}
        <fieldset className="mt-5 grid sm:grid-cols-2 gap-3">
          <legend className="text-sm font-bold text-[#2B1D16] mb-2 sm:col-span-2">Thông tin quán & thời gian hẹn</legend>

          {/* Khối thông tin quán ăn phục vụ */}
          {primaryRestaurant && (
            <div className="sm:col-span-2 rounded-2xl bg-gradient-to-br from-[#FFF8F3] to-[#FFF1E8] border-2 border-[#F1D5C4] p-3.5 sm:p-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#D9452B] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#D9452B]/20">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#2B1D16]">{primaryRestaurant.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Đã xác thực
                      </span>
                    </div>
                    {primaryRestaurant.ownerName && (
                      <p className="text-xs text-stone-600 mt-1">
                        <span className="font-semibold text-stone-700">Chủ quán:</span> {primaryRestaurant.ownerName}
                      </p>
                    )}
                    <p className="text-xs text-stone-600 mt-1 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D9452B] shrink-0 mt-0.5" />
                      <span>{primaryRestaurant.address}</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-3.5 flex-wrap text-xs text-stone-600">
                      {primaryRestaurant.phone && (
                        <a
                          href={`tel:${primaryRestaurant.phone}`}
                          className="flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Hotline: {primaryRestaurant.phone}</span>
                        </a>
                      )}
                      {(primaryRestaurant.openTime || primaryRestaurant.closeTime) && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Mở cửa: {primaryRestaurant.openTime || '07:30'} – {primaryRestaurant.closeTime || '22:00'}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F1E4D8] text-[11px] text-[#7D6B62] flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#D9452B] shrink-0" />
                <span>Bàn ăn này được đặt tại <strong>{primaryRestaurant.name}</strong>. Quý khách và bạn bè đến thưởng thức đúng giờ đã hẹn.</span>
              </div>
            </div>
          )}

          {/* Ngày hẹn và giờ hẹn */}
          <input
            id="mn-in-date"
            type="date"
            className={inputCls}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Ngày hẹn"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              id="mn-in-time"
              type="time"
              className={inputCls}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Giờ hẹn"
            />
            <select
              id="mn-in-duration"
              className={inputCls}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              aria-label="Thời lượng"
            >
              <option value={30}>30 phút</option>
              <option value={60}>1 giờ</option>
              <option value={90}>1,5 giờ</option>
              <option value={120}>2 giờ</option>
              <option value={180}>3 giờ</option>
            </select>
          </div>
        </fieldset>

        {/* ================= 4. THÔNG TIN BÀN & TỔNG KẾT MÓN ================= */}
        <fieldset className="mt-5 grid sm:grid-cols-2 gap-3">
          <legend className="text-sm font-bold text-[#2B1D16] mb-2 sm:col-span-2">Thông tin người đặt & số chỗ</legend>
          <div className="flex items-center justify-between rounded-2xl bg-[#FFFBF8] border border-[#EADBD0] px-4 py-2">
            <span className="text-[15px] text-[#5A4A42]">Số chỗ</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Giảm"
                onClick={() => setCapacity((c) => Math.max(2, c - 1))}
                className="w-8 h-8 rounded-full bg-white border border-[#EADBD0] grid place-items-center hover:border-[#D9452B]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center font-bold text-lg">{capacity}</span>
              <button
                type="button"
                aria-label="Tăng"
                onClick={() => setCapacity((c) => Math.min(12, c + 1))}
                className="w-8 h-8 rounded-full bg-white border border-[#EADBD0] grid place-items-center hover:border-[#D9452B]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <input
            id="mn-in-host"
            className={inputCls}
            placeholder="Họ tên của bạn *"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
          <input
            id="mn-in-phone"
            type="tel"
            className={`${inputCls} sm:col-span-2`}
            placeholder="Số điện thoại liên hệ *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            id="mn-in-note"
            className={`${inputCls} sm:col-span-2 resize-none`}
            rows={2}
            placeholder="Lời nhắn (vd: chia tiền đều, có chỗ đậu xe, phòng lạnh…)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          {/* Tóm tắt các món đã chọn */}
          {selectedDishIds.length > 0 && (
            <div className="sm:col-span-2 rounded-xl bg-[#FFF8F3] border border-[#F1E4D8] p-3 text-xs text-left">
              <span className="font-bold text-[#2B1D16]">Món đã chọn ({selectedDishIds.length}): </span>
              <span className="text-[#D9452B] font-semibold">
                {selectedDishIds.map((id) => allDishes.find((d) => d.id === id)?.name || id).join(', ')}
              </span>
            </div>
          )}
        </fieldset>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-[#FDEDE8] text-[#C0392B] text-sm font-medium px-4 py-3 text-left">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-[auto_1fr] gap-3">
          <button
            type="button"
            onClick={onClose}
            className="mn-press rounded-full border-2 border-[#EADBD0] hover:border-[#2B1D16] font-bold px-6 py-3.5 transition-colors"
          >
            Hủy
          </button>
          <button
            id="mn-submit-create"
            type="submit"
            className="mn-press rounded-full bg-[#D9452B] hover:bg-[#BF3A22] text-white font-bold py-3.5 shadow-lg shadow-[#D9452B]/30 transition-colors inline-flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Tạo bàn
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

