import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwtToken } from '@/lib/auth';
import { getStoredUsers, getStoredRestaurants, upsertStoredRestaurant } from '@/lib/storage';
import { User, Restaurant } from '@/lib/types';
import { auth } from '@/auth';

/**
 * Lấy thông tin người dùng hiện tại từ NextAuth session hoặc JWT cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // 1. Kiểm tra session từ NextAuth (Google login)
    const session = await auth();
    if (session?.user?.email) {
      const email = session.user.email;
      let user: any = null;
      try {
        user = await prisma.user.findUnique({ where: { email } });
      } catch {
        const storedUsers = getStoredUsers();
        user = storedUsers.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      }
      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'USER',
          status: user.status || 'ACTIVE',
          avatar: user.avatar || user.image || session.user.image,
          phone: user.phone,
          restaurantName: user.restaurantName,
          restaurantAddress: user.restaurantAddress,
          createdAt: typeof user.createdAt === 'string' ? user.createdAt : user.createdAt?.toISOString(),
        };
      }
    }

    // 2. Kiểm tra JWT cookie auth_token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
      const payload = verifyJwtToken(token);
      if (payload) {
        let user: any = null;
        try {
          user = await prisma.user.findUnique({ where: { id: payload.userId } });
        } catch {
          const storedUsers = getStoredUsers();
          user = storedUsers.find((u) => u.id === payload.userId || u.email === payload.email);
        }
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || payload.role || 'USER',
            status: user.status || 'ACTIVE',
            avatar: user.avatar,
            phone: user.phone,
            restaurantName: user.restaurantName,
            restaurantAddress: user.restaurantAddress,
            createdAt: typeof user.createdAt === 'string' ? user.createdAt : user.createdAt?.toISOString(),
          };
        }
      }
    }
  } catch (err) {
    console.error('Lỗi khi lấy thông tin người dùng hiện tại:', err);
  }
  return null;
}

/**
 * Guard bắt buộc đăng nhập (Customer, Owner, Cadre, Admin)
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Vui lòng đăng nhập để tiếp tục thực hiện hành động này.');
  }
  if (user.status === 'BLOCKED') {
    throw new Error('Tài khoản của bạn đã bị tạm khóa bởi Ban Quản Trị.');
  }
  return user;
}

/**
 * Guard kiểm tra quyền Chủ Quán (OWNER)
 * Phải có vai trò OWNER và trạng thái ACTIVE (hoặc là ADMIN)
 * Trả về user và Restaurant gắn liền với chủ quán
 */
export async function requireOwner(): Promise<{ user: User; restaurant: Restaurant }> {
  const user = await requireAuth();

  // Admin có toàn quyền truy cập như một chủ quán
  if (user.role === 'ADMIN') {
    let res: Restaurant | null = null;
    try {
      res = await prisma.restaurant.findFirst({ where: { isApproved: true } });
    } catch {
      const allRes = getStoredRestaurants();
      res = allRes[0] || null;
    }
    if (!res) {
      // Quán mặc định cho Admin
      const allRes = getStoredRestaurants();
      res = allRes[0] || {
        id: 'res-default',
        name: 'Quán Ăn Mẫu Ban Quản Trị',
        slug: 'quan-an-mau-ban-quan-tri',
        address: 'Xã Ea Súp, Huyện Ea Súp',
        isApproved: true,
        ownerId: user.id,
        createdAt: new Date().toISOString(),
      };
    }
    return { user, restaurant: res };
  }

  if (user.role !== 'OWNER') {
    throw new Error('Hành động này chỉ dành riêng cho Chủ Quán Ăn (Role OWNER).');
  }

  if (user.status === 'PENDING') {
    throw new Error('Tài khoản Chủ Quán của bạn đang chờ Ban Quản Trị phê duyệt. Vui lòng quay lại sau.');
  }

  // Tìm quán thuộc sở hữu của chủ quán
  let restaurant: any = null;
  try {
    restaurant = await prisma.restaurant.findFirst({ where: { ownerId: user.id } });
  } catch {
    const all = getStoredRestaurants();
    restaurant = all.find((r) => r.ownerId === user.id);
  }

  if (!restaurant) {
    // Nếu chưa tạo quán, fallback tìm theo tên quán lưu trong User
    const all = getStoredRestaurants();
    restaurant = all.find((r) => r.ownerId === user.id || (user.restaurantName && r.name.toLowerCase().includes(user.restaurantName.toLowerCase())));
  }

  // Tự động khởi tạo và lưu quán ăn cho Chủ Quán nếu chưa có, đảm bảo luôn hiển thị Dashboard quản lý quán đầy đủ
  if (!restaurant) {
    const resName = user.restaurantName || `Quán Ăn Đặc Sản ${user.name}`;
    const cleanSlug = `quan-${resName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')}-${user.id.substring(0, 5)}`;

    const newResData: any = {
      id: `res-${user.id}`,
      name: resName,
      slug: cleanSlug,
      address: user.restaurantAddress || 'Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
      village: 'Buôn A2, Ea Súp',
      phone: user.phone || '0912 345 678',
      coverImage: '/mon-ngon/ga-nuong.jpg',
      openTime: '07:30',
      closeTime: '22:00',
      isApproved: true,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      restaurant = await prisma.restaurant.create({ data: newResData });
    } catch {
      restaurant = upsertStoredRestaurant(newResData);
    }
    if (!restaurant) {
      restaurant = upsertStoredRestaurant(newResData);
    }
  }

  return { user, restaurant };
}

/**
 * Guard kiểm tra quyền Quản trị viên tối cao (ADMIN)
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('Bạn không có quyền quản trị viên tối cao để thực hiện hành động này.');
  }
  return user;
}
