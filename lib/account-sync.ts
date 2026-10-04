/**
 * Đồng bộ & thống kê Tài khoản (Khách / Chủ quán / Cán bộ) ↔ Quán ăn ↔ Món ăn.
 *
 * Nguyên tắc "một nguồn sự thật":
 *  - Mỗi quán ăn luôn có đúng 1 tài khoản Chủ quán (OWNER) tương ứng.
 *  - Mỗi Chủ quán (OWNER) luôn có 1 hồ sơ quán ăn tương ứng.
 *  - Thông tin quán (tên, địa chỉ, SĐT) lấy từ hồ sơ quán – tài khoản chủ quán phản chiếu lại.
 *  - Mọi con số hiển thị trong trang Quản trị đều được tính từ CÙNG một bộ dữ liệu đã đồng bộ này.
 *
 * File thuần (không phụ thuộc fs/prisma) để dùng được ở cả server action lẫn API route.
 */

export const CUSTOMER_ROLES = ['USER', 'TRAVELER'];
export const CADRE_ROLES = ['CADRE', 'ADMIN', 'EDITOR'];
export const LEGACY_OWNER_PLACEHOLDER = 'user-admin-default';

export interface AdminCounts {
  customers: number;
  owners: number;
  ownersActive: number;
  ownersPending: number;
  ownersBlocked: number;
  cadres: number;
  totalUsers: number;
  restaurants: number;
  restaurantsApproved: number;
  restaurantsPending: number;
}

/** Quán ẩm thực mẫu (món ăn gốc) → quán phục vụ món đó */
export const SEED_DISH_RESTAURANT: Record<string, string> = {
  'ga-nuong': 'res-ga-nuong',
  'com-lam': 'res-ga-nuong',
  'canh-thut': 'res-ga-nuong',
  'ca-nuong': 'res-ho-ea-sup',
  'lau-ca': 'res-ho-ea-sup',
  'bo-mot-nang': 'res-bo-mot-nang',
  'xoai-cat': 'res-ca-phe-gio-ho',
  'ca-phe': 'res-ca-phe-gio-ho',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/** Gỡ các quan hệ Prisma (owner, menuItems...) trước khi lưu JSON hoặc so sánh */
export function stripRestaurantRelations(r: any): any {
  const { owner, menuItems, tables, orders, bookings, ...rest } = r || {};
  return rest;
}

/** Gộp 2 danh sách theo khoá (phần tử `secondary` ghi đè `primary`) */
export function mergeByKey<T = any>(primary: T[], secondary: T[], keyFn: (item: T) => string | undefined): T[] {
  const map = new Map<string, T>();
  const order: string[] = [];
  for (const list of [primary, secondary]) {
    for (const item of list) {
      const key = keyFn(item);
      if (!key) continue;
      if (map.has(key)) {
        map.set(key, { ...(map.get(key) as any), ...(item as any) });
      } else {
        map.set(key, item);
        order.push(key);
      }
    }
  }
  return order.map((k) => map.get(k) as T);
}

export function computeCounts(users: any[], restaurants: any[]): AdminCounts {
  const owners = users.filter((u) => u.role === 'OWNER');
  return {
    customers: users.filter((u) => CUSTOMER_ROLES.includes(u.role)).length,
    owners: owners.length,
    ownersActive: owners.filter((u) => u.status === 'ACTIVE').length,
    ownersPending: owners.filter((u) => u.status === 'PENDING').length,
    ownersBlocked: owners.filter((u) => u.status === 'BLOCKED').length,
    cadres: users.filter((u) => CADRE_ROLES.includes(u.role)).length,
    totalUsers: users.length,
    restaurants: restaurants.length,
    restaurantsApproved: restaurants.filter((r) => r.isApproved).length,
    restaurantsPending: restaurants.filter((r) => !r.isApproved).length,
  };
}

/**
 * Đối soát Chủ quán ↔ Quán ăn. Trả về dữ liệu đã đồng bộ (không sửa dữ liệu đầu vào).
 */
export function reconcileAccounts(usersIn: any[], restaurantsIn: any[]) {
  const now = new Date().toISOString();
  const users: any[] = usersIn.map((u) => ({ ...u }));
  const restaurants: any[] = restaurantsIn.map((r) => ({ ...r }));

  // 1. Quán chưa có chủ (hoặc trỏ tới tài khoản không tồn tại) → gắn/tạo tài khoản Chủ quán
  for (const r of restaurants) {
    let owner = users.find((u) => u.id === r.ownerId);
    if (!owner && r.owner?.email) {
      owner = users.find((u) => u.email?.toLowerCase() === String(r.owner.email).toLowerCase());
    }
    if (!owner) {
      const suffix = String(r.id).replace(/^res-/, '');
      const wantedId =
        r.ownerId && r.ownerId !== LEGACY_OWNER_PLACEHOLDER ? r.ownerId : `user-owner-${suffix}`;
      owner = users.find((u) => u.id === wantedId);
      if (!owner) {
        owner = {
          id: wantedId,
          name: `Chủ quán ${r.name}`,
          email: `${suffix}@demo.easup.local`,
          role: 'OWNER',
          status: r.isApproved ? 'ACTIVE' : 'PENDING',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.name)}`,
          phone: r.phone || null,
          password: 'google_oauth_authenticated',
          createdAt: r.createdAt || now,
          updatedAt: now,
        };
        users.push(owner);
      }
    }
    r.ownerId = owner.id;
    if (owner.role !== 'OWNER' && !CADRE_ROLES.includes(owner.role)) {
      owner.role = 'OWNER';
    }
  }

  // 2. Chủ quán chưa có hồ sơ quán → tạo hồ sơ quán tương ứng
  for (const u of users.filter((x) => x.role === 'OWNER')) {
    if (!restaurants.some((r) => r.ownerId === u.id)) {
      const name = u.restaurantName || `Quán ăn của ${u.name}`;
      restaurants.push({
        id: `res-${u.id}`,
        name,
        slug: `${slugify(name)}-${String(u.id).slice(-5)}`,
        address: u.restaurantAddress || 'Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
        village: 'Trung tâm xã',
        phone: u.restaurantPhone || u.phone || '',
        coverImage: '/mon-ngon/ga-nuong.jpg',
        openTime: '08:00',
        closeTime: '22:00',
        isApproved: u.status === 'ACTIVE',
        ownerId: u.id,
        createdAt: u.createdAt || now,
        updatedAt: now,
      });
    }
  }

  // 3. Chuẩn hoá trạng thái & phản chiếu thông tin quán vào tài khoản chủ quán
  for (const u of users) {
    if (u.role === 'OWNER') {
      const r = restaurants.find((x) => x.ownerId === u.id);
      if (!u.status) u.status = r?.isApproved ? 'ACTIVE' : 'PENDING';
      if (r) {
        u.restaurantName = r.name;
        u.restaurantAddress = r.address;
        u.restaurantPhone = r.phone || u.restaurantPhone || null;
      }
    } else if (!u.status) {
      u.status = 'ACTIVE';
    }
  }

  // Gắn lại thông tin chủ quán vào từng quán (chỉ dùng hiển thị)
  const restaurantsWithOwner = restaurants.map((r) => ({
    ...r,
    owner: users.find((u) => u.id === r.ownerId),
  }));

  return {
    users,
    restaurants: restaurantsWithOwner,
    counts: computeCounts(users, restaurants),
  };
}

/** Gắn thông tin quán + chủ quán vào từng món ăn để hiển thị ngay trên thẻ món */
export function attachRestaurantToDishes(dishes: any[], users: any[], restaurants: any[]) {
  const synced = reconcileAccounts(users, restaurants);
  return dishes.map((dish) => {
    const resId = dish.restaurantId || SEED_DISH_RESTAURANT[dish.id];
    const r =
      synced.restaurants.find((x) => x.id === resId) ||
      (dish.ownerId ? synced.restaurants.find((x) => x.ownerId === dish.ownerId) : undefined);

    if (!r) return dish;

    return {
      ...dish,
      restaurantId: r.id,
      restaurantName: r.name,
      restaurantAddress: r.address,
      restaurant: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        address: r.address,
        village: r.village || null,
        phone: r.phone || r.owner?.phone || null,
        openTime: r.openTime || null,
        closeTime: r.closeTime || null,
        coverImage: r.coverImage || null,
        isApproved: !!r.isApproved,
        ownerName: r.owner?.name || null,
      },
    };
  });
}
