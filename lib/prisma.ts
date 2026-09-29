import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_DESTINATIONS, INITIAL_ITINERARIES, INITIAL_USERS } from './data/seed-data';
import { Destination, RouteStop, ItineraryItem } from './types';

// Global variable để tránh khởi tạo nhiều Prisma client instance khi Next.js hot-reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Công thức Haversine tính khoảng cách giữa 2 tọa độ GPS (km)
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// In-memory data store for fallback khi chưa kết nối PostgreSQL hoặc môi trường test
let memoryDestinations = [...INITIAL_DESTINATIONS];
const memoryCategories = [...INITIAL_CATEGORIES];
const memoryItineraries = [...INITIAL_ITINERARIES];

export async function getDbDestinations(options?: {
  query?: string;
  categorySlug?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
}) {
  try {
    // Thử truy vấn cơ sở dữ liệu PostgreSQL thực tế qua Prisma
    const where: Record<string, unknown> = { isPublished: true };

    if (options?.categorySlug && options.categorySlug !== 'all') {
      where.category = { slug: options.categorySlug };
    }

    if (options?.query) {
      where.OR = [
        { title: { contains: options.query, mode: 'insensitive' } },
        { content: { contains: options.query, mode: 'insensitive' } },
        { address: { contains: options.query, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.destination.findMany({
      where,
      include: {
        category: true,
        reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      },
      orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
    });

    let results: Destination[] = items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      reviews: item.reviews?.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    }));

    if (options?.lat && options?.lng) {
      results = results.map((d) => ({
        ...d,
        distanceKm: calculateDistanceKm(options.lat!, options.lng!, d.latitude, d.longitude),
      }));

      if (options.radiusKm) {
        results = results.filter((d) => (d.distanceKm || 0) <= options.radiusKm!);
      }

      results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return results;
  } catch (error) {
    // Fallback thông minh sang bộ dữ liệu mẫu (Seed Data) nếu DB chưa kết nối
    console.warn('Prisma DB not reachable, falling back to rich seed data:', error instanceof Error ? error.message : error);

    let list = [...memoryDestinations];

    if (options?.categorySlug && options.categorySlug !== 'all') {
      list = list.filter((d) => {
        const cat = memoryCategories.find((c) => c.id === d.categoryId);
        return cat?.slug === options.categorySlug;
      });
    }

    if (options?.query) {
      const q = options.query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }

    if (options?.lat && options?.lng) {
      list = list.map((d) => ({
        ...d,
        distanceKm: calculateDistanceKm(options.lat!, options.lng!, d.latitude, d.longitude),
      }));

      if (options.radiusKm) {
        list = list.filter((d) => (d.distanceKm || 0) <= options.radiusKm!);
      }

      list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return list.map((d) => {
      const cat = memoryCategories.find((c) => c.id === d.categoryId);
      return { ...d, category: cat };
    });
  }
}

export async function getDbDestinationBySlug(slug: string) {
  try {
    const item = await prisma.destination.findUnique({
      where: { slug },
      include: {
        category: true,
        reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!item) return null;

    // Tăng views count
    await prisma.destination.update({
      where: { id: item.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      reviews: item.reviews?.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch {
    const item = memoryDestinations.find((d) => d.slug === slug);
    if (!item) return null;
    const cat = memoryCategories.find((c) => c.id === item.categoryId);
    return { ...item, category: cat, viewsCount: item.viewsCount + 1 };
  }
}

export async function getDbCategories() {
  try {
    return await prisma.category.findMany({ orderBy: { name: 'asc' } });
  } catch {
    return memoryCategories;
  }
}

export async function getDbItineraries(): Promise<ItineraryItem[]> {
  try {
    const items = await prisma.itineraryItem.findMany({ orderBy: { createdAt: 'asc' } });
    return items.map((i) => ({
      ...i,
      routeDetails: i.routeDetails as unknown as RouteStop[],
      createdAt: i.createdAt.toISOString(),
    }));
  } catch {
    return memoryItineraries;
  }
}

export function addMemoryDestination(newDest: Destination) {
  memoryDestinations = [newDest, ...memoryDestinations];
}

export function updateMemoryDestination(id: string, updated: Partial<Destination>) {
  memoryDestinations = memoryDestinations.map((d) => (d.id === id ? { ...d, ...updated } : d));
}

export function deleteMemoryDestination(id: string) {
  memoryDestinations = memoryDestinations.filter((d) => d.id !== id);
}
