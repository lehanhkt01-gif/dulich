import fs from 'fs';
import path from 'path';
import {
  Destination,
  Category,
  ItineraryItem,
  User,
  DishItem,
  Restaurant,
  MenuItem,
  Table,
  Order,
  Booking,
  Notification,
  OrderStatus,
  BookingStatus,
} from './types';
import { INITIAL_CATEGORIES, INITIAL_DESTINATIONS, INITIAL_ITINERARIES, INITIAL_USERS } from './data/seed-data';
import { DISHES } from './data/mon-ngon';

// Thư mục lưu trữ dữ liệu bền vững (JSON Storage)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Lỗi khi tạo thư mục data:', err);
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJsonFile(filename, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Lỗi khi đọc file ${filename}:`, err);
    return defaultValue;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Lỗi khi ghi file ${filename}:`, err);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Ghi trực tiếp file ${filename} thất bại:`, e);
    }
  }
}

// =============================================================================
// DESTINATIONS (DI TÍCH & DANH LAM THẮNG CẢNH)
// =============================================================================
const DESTINATIONS_FILE = 'destinations.json';

export function getStoredDestinations(): Destination[] {
  return readJsonFile<Destination[]>(DESTINATIONS_FILE, INITIAL_DESTINATIONS);
}

export function saveStoredDestinations(items: Destination[]): void {
  writeJsonFile(DESTINATIONS_FILE, items);
}

export function getStoredDestinationBySlug(slug: string): Destination | null {
  const items = getStoredDestinations();
  return items.find((d) => d.slug === slug) || null;
}

export function upsertStoredDestination(dest: Partial<Destination> & { slug: string; title: string }): Destination {
  const items = getStoredDestinations();
  const existingIdx = items.findIndex((d) => d.slug === dest.slug || (dest.id && d.id === dest.id));

  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Destination = {
      ...items[existingIdx],
      ...dest,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredDestinations(items);
    return updated;
  } else {
    const newDest: Destination = {
      id: dest.id || `dest-${Date.now()}`,
      title: dest.title,
      slug: dest.slug,
      subTitle: dest.subTitle || '',
      historicalPeriod: dest.historicalPeriod || '',
      content: dest.content || '',
      audioVoiceUrl: dest.audioVoiceUrl || '',
      thumbnail: dest.thumbnail || '/placeholder.jpg',
      gallery: dest.gallery || [dest.thumbnail || '/placeholder.jpg'],
      address: dest.address || 'Xã Ea Súp, Tỉnh Đắk Lắk',
      latitude: dest.latitude || 13.070029,
      longitude: dest.longitude || 107.883355,
      bestSeason: dest.bestSeason || '',
      entryFee: dest.entryFee || 'Miễn phí tham quan',
      visitingHours: dest.visitingHours || '07:00 - 17:30',
      culturalNotes: dest.culturalNotes || '',
      categoryId: dest.categoryId || 'cat-di-tich',
      isPublished: dest.isPublished !== undefined ? dest.isPublished : true,
      isFeatured: Boolean(dest.isFeatured),
      viewsCount: dest.viewsCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    const updatedList = [newDest, ...items];
    saveStoredDestinations(updatedList);
    return newDest;
  }
}

export function deleteStoredDestination(slug: string): boolean {
  const items = getStoredDestinations();
  const filtered = items.filter((d) => d.slug !== slug);
  if (filtered.length !== items.length) {
    saveStoredDestinations(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// USERS (TÀI KHOẢN, PHÂN QUYỀN, CHỦ QUÁN & KHÁCH)
// =============================================================================
const USERS_FILE = 'users.json';

export function getStoredUsers(): any[] {
  return readJsonFile<any[]>(USERS_FILE, INITIAL_USERS);
}

export function saveStoredUsers(users: any[]): void {
  writeJsonFile(USERS_FILE, users);
}

export function getStoredUserById(id: string): any | null {
  const users = getStoredUsers();
  return users.find((u) => u.id === id) || null;
}

export function getStoredUserByEmail(email: string): any | null {
  const users = getStoredUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function upsertStoredUser(user: any): any {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => (user.email && u.email?.toLowerCase() === user.email?.toLowerCase()) || (user.id && u.id === user.id));
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
    saveStoredUsers(users);
    return users[idx];
  } else {
    const newUser = {
      ...user,
      id: user.id || `user-${Date.now()}`,
      role: user.role || 'TRAVELER',
      createdAt: user.createdAt || new Date().toISOString(),
    };
    users.push(newUser);
    saveStoredUsers(users);
    return newUser;
  }
}

export function deleteStoredUser(id: string): boolean {
  const users = getStoredUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length !== users.length) {
    saveStoredUsers(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// DISHES (MÓN ĂN & ĐẶC SẢN DO CHỦ QUÁN HOẶC ĐOÀN THANH NIÊN TẠO)
// =============================================================================
const DISHES_FILE = 'dishes.json';

export function getStoredDishes(): DishItem[] {
  const fileExists = fs.existsSync(path.join(DATA_DIR, DISHES_FILE));
  if (!fileExists) {
    const initialDishes: DishItem[] = DISHES.map((d) => ({
      ...d,
      ownerId: null,
      restaurantName: 'Ẩm thực truyền thống Ea Súp',
      restaurantAddress: 'Xã Ea Súp, Tỉnh Đắk Lắk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    writeJsonFile(DISHES_FILE, initialDishes);
    return initialDishes;
  }
  return readJsonFile<DishItem[]>(DISHES_FILE, []);
}

export function saveStoredDishes(items: DishItem[]): void {
  writeJsonFile(DISHES_FILE, items);
}

export function getStoredDishById(id: string): DishItem | null {
  const items = getStoredDishes();
  return items.find((d) => d.id === id) || null;
}

export function upsertStoredDish(dish: Partial<DishItem> & { name: string }): DishItem {
  const items = getStoredDishes();
  const existingIdx = items.findIndex((d) => (dish.id && d.id === dish.id));
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: DishItem = {
      ...items[existingIdx],
      ...dish,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredDishes(items);
    return updated;
  } else {
    const newDish: DishItem = {
      id: dish.id || `dish-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: dish.name,
      category: dish.category || 'dac-san',
      shortDesc: dish.shortDesc || '',
      story: dish.story || '',
      image: dish.image || '/mon-ngon/ga-nuong.jpg',
      priceRange: dish.priceRange || 'Theo thời giá',
      tags: dish.tags || ['Đặc sản Ea Súp'],
      ownerId: dish.ownerId || null,
      restaurantName: dish.restaurantName || '',
      restaurantAddress: dish.restaurantAddress || '',
      createdAt: now,
      updatedAt: now,
    };
    const updatedList = [newDish, ...items];
    saveStoredDishes(updatedList);
    return newDish;
  }
}

export function deleteStoredDish(id: string): boolean {
  const items = getStoredDishes();
  const filtered = items.filter((d) => d.id !== id);
  if (filtered.length !== items.length) {
    saveStoredDishes(filtered);
    return true;
  }
  return false;
}


// =============================================================================
// CATEGORIES & ITINERARIES
// =============================================================================
const CATEGORIES_FILE = 'categories.json';
const ITINERARIES_FILE = 'itineraries.json';

export function getStoredCategories(): Category[] {
  return readJsonFile<Category[]>(CATEGORIES_FILE, INITIAL_CATEGORIES);
}

export function getStoredItineraries(): ItineraryItem[] {
  return readJsonFile<ItineraryItem[]>(ITINERARIES_FILE, INITIAL_ITINERARIES);
}

// =============================================================================
// FOOD TABLES (BÀN ĂN & RỦ NHAU ĐI ĂN)
// =============================================================================
const FOOD_TABLES_FILE = 'food-tables.json';

export function getStoredFoodTables(): any[] {
  const fileExists = fs.existsSync(path.join(DATA_DIR, FOOD_TABLES_FILE));
  if (!fileExists) {
    // Khởi tạo các bàn mẫu mặc định
    const defaultTables = [
      {
        id: 'table-sample-1',
        dishId: 'ca-phe',
        restaurant: 'Quán Cà Phê Bên Hồ Ea Súp',
        address: 'Đường ven hồ Ea Súp Thượng, xã Ea Súp, Đắk Lắk',
        startAt: new Date(Date.now() + 86400000).toISOString(),
        durationMin: 60,
        capacity: 4,
        joined: 2,
        host: 'H’Lan',
        note: 'Cà phê sáng rồi cùng đi Tháp Chàm Yang Prông.',
        latitude: 13.2389,
        longitude: 107.8452,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'table-sample-2',
        dishId: 'ga-nuong',
        restaurant: 'Quán Gà Nướng Cơm Lam Buôn Đôn - Ea Súp',
        address: 'Quốc Lộ 14C, Trung tâm xã Ea Súp, Đắk Lắk',
        startAt: new Date(Date.now() + 4 * 3600000).toISOString(),
        durationMin: 90,
        capacity: 6,
        joined: 3,
        host: 'Minh Tuấn',
        note: 'Đặt 2 con gà thả vườn, chia tiền đều nhé!',
        latitude: 13.2456,
        longitude: 107.8381,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'table-sample-3',
        dishId: 'lau-ca',
        restaurant: 'Nhà Hàng Lòng Hồ Ea Súp',
        address: 'Khu vực đập chính hồ Ea Súp Thượng, Đắk Lắk',
        startAt: new Date(Date.now() + 26 * 3600000).toISOString(),
        durationMin: 120,
        capacity: 5,
        joined: 4,
        host: 'Y Khoa',
        note: 'Lẩu cá lăng nấu chua rau rừng, mát mẻ ven hồ.',
        latitude: 13.2312,
        longitude: 107.8567,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'table-sample-4',
        dishId: 'canh-thut',
        restaurant: 'Bếp Ẩm Thực Truyền Thống Buôn A2',
        address: 'Buôn A2, xã Ea Súp, Đắk Lắk',
        startAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        durationMin: 90,
        capacity: 4,
        joined: 1,
        host: 'H’Nga',
        note: 'Trải nghiệm canh thụt ống tre, cà đắng và rượu cần.',
        latitude: 13.2501,
        longitude: 107.8294,
        isCancelled: false,
        createdAt: new Date().toISOString(),
      }
    ];
    writeJsonFile(FOOD_TABLES_FILE, defaultTables);
    return defaultTables;
  }
  return readJsonFile<any[]>(FOOD_TABLES_FILE, []);
}

export function saveStoredFoodTables(items: any[]): void {
  writeJsonFile(FOOD_TABLES_FILE, items);
}

export function upsertStoredFoodTable(table: any): any {
  const items = getStoredFoodTables();
  const existingIdx = items.findIndex((t) => t.id === table.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated = {
      ...items[existingIdx],
      ...table,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredFoodTables(items);
    return updated;
  } else {
    const newTable = {
      ...table,
      id: table.id || `table-${Date.now()}`,
      joined: table.joined || 1,
      ownerId: table.ownerId || null,
      isCancelled: false,
      createdAt: now,
      updatedAt: now,
    };
    const updatedList = [newTable, ...items];
    saveStoredFoodTables(updatedList);
    return newTable;
  }
}

export function joinStoredFoodTable(id: string): { success: boolean; table?: any; message?: string } {
  const items = getStoredFoodTables();
  const idx = items.findIndex((t) => t.id === id);
  if (idx < 0) return { success: false, message: 'Không tìm thấy bàn' };

  const table = items[idx];
  if (table.joined >= table.capacity) {
    return { success: false, message: 'Bàn đã đủ người tham gia' };
  }

  table.joined += 1;
  table.updatedAt = new Date().toISOString();
  items[idx] = table;
  saveStoredFoodTables(items);
  return { success: true, table };
}

export function cancelStoredFoodTable(id: string): { success: boolean; table?: any } {
  const items = getStoredFoodTables();
  const idx = items.findIndex((t) => t.id === id);
  if (idx < 0) return { success: false };

  items[idx].isCancelled = true;
  items[idx].updatedAt = new Date().toISOString();
  saveStoredFoodTables(items);
  return { success: true, table: items[idx] };
}

export function deleteStoredFoodTable(id: string): boolean {
  const items = getStoredFoodTables();
  const filtered = items.filter((t) => t.id !== id);
  if (filtered.length !== items.length) {
    saveStoredFoodTables(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// RESTAURANTS (QUÁN ĂN & NHÀ HÀNG EA SÚP)
// =============================================================================
const RESTAURANTS_FILE = 'restaurants.json';

const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'res-ga-nuong',
    name: 'Gà Nướng Cơm Lam Bản Đôn Ea Súp',
    slug: 'ga-nuong-ban-don-ea-sup',
    address: 'Buôn A2, Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
    village: 'Buôn A2',
    phone: '0987 654 321',
    coverImage: '/mon-ngon/ga-nuong.jpg',
    openTime: '08:00',
    closeTime: '21:30',
    isApproved: true,
    ownerId: 'user-admin-default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'res-ho-ea-sup',
    name: 'Ẩm Thực Sinh Thái Lòng Hồ Ea Súp Thượng',
    slug: 'am-thuc-ho-ea-sup-thuong',
    address: 'Khu du lịch sinh thái Hồ Ea Súp Thượng, Xã Ea Súp',
    village: 'Hồ Ea Súp',
    phone: '0912 345 678',
    coverImage: '/mon-ngon/ca-nuong.jpg',
    openTime: '07:30',
    closeTime: '22:00',
    isApproved: true,
    ownerId: 'user-admin-default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'res-bo-mot-nang',
    name: 'Bò Một Nắng & Ẩm Thực Tây Nguyên Thôn 1',
    slug: 'bo-mot-nang-thon-1-ea-sup',
    address: 'Thôn 1, Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
    village: 'Thôn 1',
    phone: '0934 567 890',
    coverImage: '/mon-ngon/bo-mot-nang.jpg',
    openTime: '09:00',
    closeTime: '22:00',
    isApproved: true,
    ownerId: 'user-admin-default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'res-ca-phe-gio-ho',
    name: 'Cà Phê Gió Hồ & Điểm Hẹn Đại Ngàn',
    slug: 'ca-phe-gio-ho-ea-sup',
    address: 'Đường ven hồ sinh thái, Xã Ea Súp, Huyện Ea Súp',
    village: 'Thôn 2',
    phone: '0945 678 123',
    coverImage: '/mon-ngon/ca-phe.jpg',
    openTime: '06:30',
    closeTime: '22:30',
    isApproved: true,
    ownerId: 'user-admin-default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getStoredRestaurants(): Restaurant[] {
  return readJsonFile<Restaurant[]>(RESTAURANTS_FILE, INITIAL_RESTAURANTS);
}

export function saveStoredRestaurants(items: Restaurant[]): void {
  writeJsonFile(RESTAURANTS_FILE, items);
}

export function getStoredRestaurantById(id: string): Restaurant | null {
  const items = getStoredRestaurants();
  return items.find((r) => r.id === id) || null;
}

export function getStoredRestaurantBySlug(slug: string): Restaurant | null {
  const items = getStoredRestaurants();
  return items.find((r) => r.slug === slug) || null;
}

export function getStoredRestaurantByOwnerId(ownerId: string): Restaurant | null {
  const items = getStoredRestaurants();
  return items.find((r) => r.ownerId === ownerId) || null;
}

export function upsertStoredRestaurant(data: Partial<Restaurant> & { name: string; ownerId: string }): Restaurant {
  const items = getStoredRestaurants();
  const slug = data.slug || data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existingIdx = items.findIndex((r) => (data.id && r.id === data.id) || r.ownerId === data.ownerId || r.slug === slug);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Restaurant = {
      ...items[existingIdx],
      ...data,
      slug: data.slug || items[existingIdx].slug,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredRestaurants(items);
    return updated;
  } else {
    const newRes: Restaurant = {
      id: data.id || `res-${Date.now()}`,
      name: data.name,
      slug,
      address: data.address || 'Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
      village: data.village || 'Trung tâm xã',
      phone: data.phone || '',
      coverImage: data.coverImage || '/mon-ngon/ga-nuong.jpg',
      openTime: data.openTime || '08:00',
      closeTime: data.closeTime || '22:00',
      isApproved: data.isApproved !== undefined ? data.isApproved : false,
      ownerId: data.ownerId,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newRes);
    saveStoredRestaurants(items);
    return newRes;
  }
}

export function deleteStoredRestaurant(id: string): boolean {
  const items = getStoredRestaurants();
  const filtered = items.filter((r) => r.id !== id);
  if (filtered.length !== items.length) {
    saveStoredRestaurants(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// MENU ITEMS (MÓN ĂN TRONG THỰC ĐƠN QUÁN)
// =============================================================================
const MENU_ITEMS_FILE = 'menu-items.json';

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Quán Gà nướng
  {
    id: 'menu-1',
    restaurantId: 'res-ga-nuong',
    name: 'Gà Nướng Mọi Than Củi Bản Đôn',
    description: 'Gà thả vườn Ea Súp tẩm ướp lá é, sả ớt rừng nướng trực tiếp trên than hồng giòn da đậm vị.',
    price: 240000,
    image: '/mon-ngon/ga-nuong.jpg',
    category: 'Món chính',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'menu-2',
    restaurantId: 'res-ga-nuong',
    name: 'Cơm Lam Ống Nứa Thơm Dẻo',
    description: 'Gạo nếp nương Ea Súp ngâm nước suối rừng, nướng trong ống nứa non, ăn kèm muối mè đen.',
    price: 35000,
    image: '/mon-ngon/com-lam.jpg',
    category: 'Món chính',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'menu-3',
    restaurantId: 'res-ga-nuong',
    name: 'Canh Thụt Đọt Mây Ống Tre',
    description: 'Đặc sản truyền thống nấu trong ống tre với đọt mây, cà đắng rừng và thịt nướng thái mỏng.',
    price: 95000,
    image: '/mon-ngon/canh-thut.jpg',
    category: 'Đặc sản Tây Nguyên',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Quán Lòng Hồ
  {
    id: 'menu-4',
    restaurantId: 'res-ho-ea-sup',
    name: 'Cá Lăng Hồ Ea Súp Nướng Muối Ớt Rừng',
    description: 'Cá lăng tươi đánh bắt tự nhiên từ hồ Ea Súp Thượng, thịt ngọt chắc nướng kèm muối ớt sim.',
    price: 220000,
    image: '/mon-ngon/ca-nuong.jpg',
    category: 'Món chính',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'menu-5',
    restaurantId: 'res-ho-ea-sup',
    name: 'Lẩu Cá Chép Giòn Măng Chua Rừng',
    description: 'Nồi lẩu chua thanh nấu từ măng giang rừng Ea Súp, cá chép lòng hồ giòn sần sật.',
    price: 280000,
    image: '/mon-ngon/lau-ca.jpg',
    category: 'Món chính',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Quán Bò Một Nắng
  {
    id: 'menu-6',
    restaurantId: 'res-bo-mot-nang',
    name: 'Bò Một Nắng Muối Kiến Vàng',
    description: 'Thịt bò tơ chăn thả đồng cỏ Ea Súp phơi đúng 1 nắng gắt bazan, chấm muối kiến vàng Krông Pa chua cay bùi béo.',
    price: 180000,
    image: '/mon-ngon/bo-mot-nang.jpg',
    category: 'Đặc sản Tây Nguyên',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Quán Cà Phê
  {
    id: 'menu-7',
    restaurantId: 'res-ca-phe-gio-ho',
    name: 'Cà Phê Robusta Ea Súp Nguyên Chất',
    description: 'Hạt cà phê hái chín vùng cao Ea Súp rang mộc thủ công, pha phin nhỏ giọt đậm đà.',
    price: 25000,
    image: '/mon-ngon/ca-phe.jpg',
    category: 'Đồ uống',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'menu-8',
    restaurantId: 'res-ca-phe-gio-ho',
    name: 'Xoài Cát Ea Súp Ướp Lạnh',
    description: 'Xoài cát Ea Súp nức tiếng vỏ mỏng ngọt lịm, thái múi ướp lạnh tráng miệng thơm mát.',
    price: 35000,
    image: '/mon-ngon/xoai-cat.jpg',
    category: 'Ăn vặt',
    isAvailable: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getStoredMenuItems(restaurantId?: string): MenuItem[] {
  const items = readJsonFile<MenuItem[]>(MENU_ITEMS_FILE, INITIAL_MENU_ITEMS);
  if (restaurantId) {
    return items.filter((m) => m.restaurantId === restaurantId);
  }
  return items;
}

export function saveStoredMenuItems(items: MenuItem[]): void {
  writeJsonFile(MENU_ITEMS_FILE, items);
}

export function getStoredMenuItemById(id: string): MenuItem | null {
  const items = getStoredMenuItems();
  return items.find((m) => m.id === id) || null;
}

export function upsertStoredMenuItem(data: Partial<MenuItem> & { name: string; restaurantId: string; price: number }): MenuItem {
  const items = getStoredMenuItems();
  const existingIdx = items.findIndex((m) => data.id && m.id === data.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: MenuItem = {
      ...items[existingIdx],
      ...data,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredMenuItems(items);
    return updated;
  } else {
    const newItem: MenuItem = {
      id: data.id || `menu-${Date.now()}`,
      restaurantId: data.restaurantId,
      name: data.name,
      description: data.description || '',
      price: data.price,
      image: data.image || '/mon-ngon/ga-nuong.jpg',
      category: data.category || 'Món chính',
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newItem);
    saveStoredMenuItems(items);
    return newItem;
  }
}

export function deleteStoredMenuItem(id: string): boolean {
  const items = getStoredMenuItems();
  const filtered = items.filter((m) => m.id !== id);
  if (filtered.length !== items.length) {
    saveStoredMenuItems(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// TABLES (BÀN ĂN CỦA QUÁN)
// =============================================================================
const TABLES_FILE = 'tables.json';

const INITIAL_TABLES: Table[] = [
  { id: 'tab-1', restaurantId: 'res-ga-nuong', name: 'Bàn Tròn Nhà Rông 1', capacity: 6, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-2', restaurantId: 'res-ga-nuong', name: 'Bàn Dài Hội Họp 2', capacity: 10, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-3', restaurantId: 'res-ga-nuong', name: 'Chòi Lá Sân Vườn 3', capacity: 4, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-4', restaurantId: 'res-ho-ea-sup', name: 'Bàn Bờ Hồ Ngắm Cảnh 1', capacity: 4, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-5', restaurantId: 'res-ho-ea-sup', name: 'Nhà Nổi Trên Nước 2', capacity: 8, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-6', restaurantId: 'res-bo-mot-nang', name: 'Bàn Gỗ Mộc 1', capacity: 4, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'tab-7', restaurantId: 'res-ca-phe-gio-ho', name: 'Bàn View Hồ Hoàng Hôn 1', capacity: 2, status: 'AVAILABLE', createdAt: new Date().toISOString() },
];

export function getStoredTables(restaurantId?: string): Table[] {
  const items = readJsonFile<Table[]>(TABLES_FILE, INITIAL_TABLES);
  if (restaurantId) {
    return items.filter((t) => t.restaurantId === restaurantId);
  }
  return items;
}

export function saveStoredTables(items: Table[]): void {
  writeJsonFile(TABLES_FILE, items);
}

export function upsertStoredTable(data: Partial<Table> & { name: string; restaurantId: string }): Table {
  const items = getStoredTables();
  const existingIdx = items.findIndex((t) => data.id && t.id === data.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Table = {
      ...items[existingIdx],
      ...data,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredTables(items);
    return updated;
  } else {
    const newTab: Table = {
      id: data.id || `tab-${Date.now()}`,
      restaurantId: data.restaurantId,
      name: data.name,
      capacity: data.capacity || 4,
      status: data.status || 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
    };
    items.push(newTab);
    saveStoredTables(items);
    return newTab;
  }
}

export function deleteStoredTable(id: string): boolean {
  const items = getStoredTables();
  const filtered = items.filter((t) => t.id !== id);
  if (filtered.length !== items.length) {
    saveStoredTables(filtered);
    return true;
  }
  return false;
}

// =============================================================================
// ORDERS (ĐƠN ĐẶT MÓN)
// =============================================================================
const ORDERS_FILE = 'orders.json';

export function getStoredOrders(restaurantId?: string, userId?: string): Order[] {
  let items = readJsonFile<Order[]>(ORDERS_FILE, []);
  if (restaurantId) {
    items = items.filter((o) => o.restaurantId === restaurantId);
  }
  if (userId) {
    items = items.filter((o) => o.userId === userId);
  }
  return items;
}

export function saveStoredOrders(items: Order[]): void {
  writeJsonFile(ORDERS_FILE, items);
}

export function getStoredOrderById(id: string): Order | null {
  const items = getStoredOrders();
  return items.find((o) => o.id === id) || null;
}

export function upsertStoredOrder(order: Partial<Order> & { restaurantId: string; userId: string; customerName: string; customerPhone: string }): Order {
  const items = getStoredOrders();
  const existingIdx = items.findIndex((o) => order.id && o.id === order.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Order = {
      ...items[existingIdx],
      ...order,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredOrders(items);
    return updated;
  } else {
    const newOrder: Order = {
      id: order.id || `order-${Date.now()}`,
      restaurantId: order.restaurantId,
      userId: order.userId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      status: order.status || 'PENDING',
      totalAmount: order.totalAmount || 0,
      note: order.note || '',
      orderItems: order.orderItems || [],
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newOrder);
    saveStoredOrders(items);
    return newOrder;
  }
}

export function updateStoredOrderStatus(id: string, status: OrderStatus): Order | null {
  const items = getStoredOrders();
  const idx = items.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  items[idx].status = status;
  items[idx].updatedAt = new Date().toISOString();
  saveStoredOrders(items);
  return items[idx];
}

// =============================================================================
// BOOKINGS (ĐẶT BÀN TRƯỚC)
// =============================================================================
const BOOKINGS_FILE = 'bookings.json';

export function getStoredBookings(restaurantId?: string, userId?: string): Booking[] {
  let items = readJsonFile<Booking[]>(BOOKINGS_FILE, []);
  if (restaurantId) {
    items = items.filter((b) => b.restaurantId === restaurantId);
  }
  if (userId) {
    items = items.filter((b) => b.userId === userId);
  }
  return items;
}

export function saveStoredBookings(items: Booking[]): void {
  writeJsonFile(BOOKINGS_FILE, items);
}

export function getStoredBookingById(id: string): Booking | null {
  const items = getStoredBookings();
  return items.find((b) => b.id === id) || null;
}

export function upsertStoredBooking(booking: Partial<Booking> & { restaurantId: string; userId: string; customerName: string; customerPhone: string; bookingTime: string }): Booking {
  const items = getStoredBookings();
  const existingIdx = items.findIndex((b) => booking.id && b.id === booking.id);
  const now = new Date().toISOString();

  if (existingIdx >= 0) {
    const updated: Booking = {
      ...items[existingIdx],
      ...booking,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveStoredBookings(items);
    return updated;
  } else {
    const newBooking: Booking = {
      id: booking.id || `book-${Date.now()}`,
      restaurantId: booking.restaurantId,
      userId: booking.userId,
      tableId: booking.tableId || null,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      bookingTime: booking.bookingTime,
      guestCount: booking.guestCount || 2,
      status: booking.status || 'PENDING',
      note: booking.note || '',
      createdAt: now,
      updatedAt: now,
    };
    items.unshift(newBooking);
    saveStoredBookings(items);
    return newBooking;
  }
}

export function updateStoredBookingStatus(id: string, status: BookingStatus): Booking | null {
  const items = getStoredBookings();
  const idx = items.findIndex((b) => b.id === id);
  if (idx < 0) return null;
  items[idx].status = status;
  items[idx].updatedAt = new Date().toISOString();
  saveStoredBookings(items);
  return items[idx];
}

// =============================================================================
// NOTIFICATIONS (HỘP THƯ & THÔNG BÁO NGƯỜI DÙNG)
// =============================================================================
const NOTIFICATIONS_FILE = 'notifications.json';

export function getStoredNotifications(userId?: string): Notification[] {
  let items = readJsonFile<Notification[]>(NOTIFICATIONS_FILE, []);
  if (userId) {
    items = items.filter((n) => n.userId === userId);
  }
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function saveStoredNotifications(items: Notification[]): void {
  writeJsonFile(NOTIFICATIONS_FILE, items);
}

export function addStoredNotification(notif: { userId: string; title: string; message: string; link?: string }): Notification {
  const items = readJsonFile<Notification[]>(NOTIFICATIONS_FILE, []);
  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: notif.userId,
    title: notif.title,
    message: notif.message,
    link: notif.link || null,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  items.unshift(newNotif);
  saveStoredNotifications(items);
  return newNotif;
}

export function markStoredNotificationAsRead(id: string): boolean {
  const items = readJsonFile<Notification[]>(NOTIFICATIONS_FILE, []);
  const idx = items.findIndex((n) => n.id === id);
  if (idx >= 0) {
    items[idx].isRead = true;
    saveStoredNotifications(items);
    return true;
  }
  return false;
}
