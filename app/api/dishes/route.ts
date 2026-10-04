import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireRole, isAdmin, canManageEntity } from '@/lib/auth';
import {
  getStoredDishes,
  upsertStoredDish,
  getStoredUserById,
  getStoredUsers,
  getStoredRestaurants,
} from '@/lib/storage';
import { attachRestaurantToDishes } from '@/lib/account-sync';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get('ownerId');
    const category = searchParams.get('category');
    const search = searchParams.get('q')?.toLowerCase();

    let dishes = getStoredDishes();

    if (ownerId) {
      dishes = dishes.filter((d) => d.ownerId === ownerId);
    }

    if (category && category !== 'all') {
      dishes = dishes.filter((d) => d.category === category);
    }

    if (search) {
      dishes = dishes.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.shortDesc.toLowerCase().includes(search) ||
          (d.restaurantName && d.restaurantName.toLowerCase().includes(search))
      );
    }

    // Gắn thông tin quán / chủ quán tương ứng vào từng món
    dishes = attachRestaurantToDishes(dishes, getStoredUsers(), getStoredRestaurants());

    return NextResponse.json({
      success: true,
      data: dishes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi tải danh sách món ăn: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập để thực hiện thao tác này' },
        { status: 401 }
      );
    }

    // Chỉ Chủ quán (OWNER) hoặc Quản trị viên (ADMIN) mới có quyền tạo món
    if (!requireRole(user, ['OWNER', 'ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Bạn cần tài khoản Chủ quán (OWNER) hoặc Quản trị viên để đăng món ăn' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, category, shortDesc, story, image, priceRange, tags, restaurantName, restaurantAddress } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Tên món ăn không được để trống' },
        { status: 400 }
      );
    }

    // Lấy thông tin quán của chủ quán nếu chưa có
    let restName = restaurantName;
    let restAddress = restaurantAddress;
    if (!restName) {
      const fullUser = getStoredUserById(user.userId);
      restName = fullUser?.restaurantName || 'Quán của ' + user.name;
      restAddress = fullUser?.restaurantAddress || 'Xã Ea Súp, Tỉnh Đắk Lắk';
    }

    const newDish = upsertStoredDish({
      name,
      category: category || 'dac-san',
      shortDesc: shortDesc || '',
      story: story || '',
      image: image || '/mon-ngon/ga-nuong.jpg',
      priceRange: priceRange || 'Theo thời giá',
      tags: tags || ['Đặc sản quán'],
      ownerId: user.userId,
      restaurantName: restName,
      restaurantAddress: restAddress,
    });

    return NextResponse.json({
      success: true,
      message: 'Thêm món ăn thành công',
      data: newDish,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi thêm món ăn: ' + error.message },
      { status: 500 }
    );
  }
}
