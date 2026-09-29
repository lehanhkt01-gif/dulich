import fs from 'fs';
import path from 'path';
import { Destination, Category, ItineraryItem, User } from './types';
import { INITIAL_CATEGORIES, INITIAL_DESTINATIONS, INITIAL_ITINERARIES, INITIAL_USERS } from './data/seed-data';

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
// USERS (CÁN BỘ QUẢN TRỊ & PHÂN QUYỀN)
// =============================================================================
const USERS_FILE = 'users.json';

export function getStoredUsers(): any[] {
  return readJsonFile<any[]>(USERS_FILE, INITIAL_USERS);
}

export function saveStoredUsers(users: any[]): void {
  writeJsonFile(USERS_FILE, users);
}

export function upsertStoredUser(user: any): any {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.email === user.email || u.id === user.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...user };
    saveStoredUsers(users);
    return users[idx];
  } else {
    const newUser = {
      ...user,
      id: user.id || `user-${Date.now()}`,
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
