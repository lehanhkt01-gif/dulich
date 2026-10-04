import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStoredFoodTables, upsertStoredFoodTable, getStoredUserById } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth';

// GET /api/food-tables
// Lấy danh sách bàn ăn đang mở, lọc theo dishId, timeSlot
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dishId = searchParams.get('dishId');
    const ownerId = searchParams.get('ownerId');
    const includeCancelled = searchParams.get('includeCancelled') === 'true';

    let tables: any[] = [];

    try {
      const where: any = {};
      if (!includeCancelled) {
        where.isCancelled = false;
      }
      if (dishId && dishId !== 'all') {
        where.dishId = dishId;
      }
      if (ownerId) {
        where.ownerId = ownerId;
      }

      const dbTables = await (prisma as any).foodTable?.findMany({
        where,
        orderBy: { startAt: 'asc' },
      });

      if (dbTables) {
        tables = dbTables.map((t: any) => ({
          ...t,
          startAt: t.startAt.toISOString(),
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        }));
      } else {
        throw new Error('Fallback to storage');
      }
    } catch {
      // Fallback khi DB PostgreSQL chưa kết nối
      let stored = getStoredFoodTables();
      if (!includeCancelled) {
        stored = stored.filter((t) => !t.isCancelled);
      }
      if (dishId && dishId !== 'all') {
        stored = stored.filter((t) => t.dishId === dishId);
      }
      if (ownerId) {
        stored = stored.filter((t) => t.ownerId === ownerId);
      }
      tables = stored;
    }

    return NextResponse.json({
      success: true,
      total: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error('Lỗi khi tải danh sách bàn ăn:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách bàn ăn' },
      { status: 500 }
    );
  }
}

// POST /api/food-tables
// Mở bàn ăn mới
export async function POST(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    const body = await req.json();
    let {
      dishId,
      restaurant,
      address,
      startAt,
      durationMin = 90,
      capacity = 4,
      host,
      note,
      latitude,
      longitude,
      ownerId,
    } = body;

    // Nếu đã đăng nhập, tự động lấy thông tin từ tài khoản
    let effectiveOwnerId = authUser?.userId || ownerId || null;
    if (authUser && !host) {
      host = authUser.name;
    }
    if (authUser?.role === 'OWNER') {
      const fullUser = getStoredUserById(authUser.userId);
      if (fullUser?.restaurantName && !restaurant) {
        restaurant = fullUser.restaurantName;
      }
      if (fullUser?.restaurantAddress && !address) {
        address = fullUser.restaurantAddress;
      }
      if (fullUser?.restaurantLat && !latitude) {
        latitude = fullUser.restaurantLat;
      }
      if (fullUser?.restaurantLng && !longitude) {
        longitude = fullUser.restaurantLng;
      }
    }

    if (!dishId || !restaurant || !host || !startAt) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đầy đủ: món, quán, người chủ bàn và thời gian hẹn' },
        { status: 400 }
      );
    }

    const startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { success: false, message: 'Thời gian hẹn không hợp lệ' },
        { status: 400 }
      );
    }

    let createdTable: any;

    try {
      const dbCreated = await (prisma as any).foodTable?.create({
        data: {
          dishId,
          restaurant: restaurant.trim(),
          address: (address || 'Xã Ea Súp, Tỉnh Đắk Lắk').trim(),
          startAt: startDate,
          durationMin: Number(durationMin) || 90,
          capacity: Number(capacity) || 4,
          joined: 1,
          host: host.trim(),
          note: note ? note.trim() : null,
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
          ownerId: effectiveOwnerId,
        },
      });

      if (!dbCreated) throw new Error('Prisma foodTable not initialized');

      createdTable = {
        ...dbCreated,
        startAt: dbCreated.startAt.toISOString(),
        createdAt: dbCreated.createdAt.toISOString(),
        updatedAt: dbCreated.updatedAt.toISOString(),
      };
      upsertStoredFoodTable(createdTable);
    } catch {
      // Fallback sang persistent JSON storage
      createdTable = upsertStoredFoodTable({
        dishId,
        restaurant: restaurant.trim(),
        address: (address || 'Xã Ea Súp, Tỉnh Đắk Lắk').trim(),
        startAt: startDate.toISOString(),
        durationMin: Number(durationMin) || 90,
        capacity: Number(capacity) || 4,
        joined: 1,
        host: host.trim(),
        note: note ? note.trim() : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        ownerId: effectiveOwnerId,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Mở bàn thành công! Hãy rủ bạn bè cùng tham gia',
        data: createdTable,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Lỗi khi mở bàn ăn:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi mở bàn ăn' },
      { status: 500 }
    );
  }
}
