'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from './guards';
import {
  getStoredUsers,
  upsertStoredUser,
  deleteStoredUser,
  getStoredRestaurants,
  upsertStoredRestaurant,
  deleteStoredRestaurant,
  getStoredMenuItems,
  getStoredOrders,
  getStoredBookings,
  addStoredNotification,
} from '@/lib/storage';
import { Role, UserStatus } from '@/lib/types';
import { sendOwnerApprovedEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';
import {
  mergeByKey,
  reconcileAccounts,
  stripRestaurantRelations,
} from '@/lib/account-sync';
import { saveStoredUsers, saveStoredRestaurants } from '@/lib/storage';

/**
 * Lấy dữ liệu quản trị ẩm thực và tài khoản cho Admin
 */
export async function getAdminDashboardDataAction() {
  await requireAdmin();

  let dbUsers: any[] = [];
  let dbRestaurants: any[] = [];
  let menuItems: any[] = [];
  let orders: any[] = [];
  let bookings: any[] = [];

  // Dữ liệu từ PostgreSQL (nếu có) – từng bảng độc lập để một bảng lỗi không làm mất bảng khác
  try {
    dbUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {}
  try {
    dbRestaurants = await prisma.restaurant.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {}
  try {
    menuItems = await prisma.menuItem.findMany();
    orders = await prisma.order.findMany();
    bookings = await prisma.booking.findMany();
  } catch {
    menuItems = getStoredMenuItems();
    orders = getStoredOrders();
    bookings = getStoredBookings();
  }

  // Gộp với kho JSON bền vững (kho mà mọi thao tác đăng ký / duyệt đều ghi vào)
  const mergedUsers = mergeByKey<any>(dbUsers, getStoredUsers(), (u) => u.email?.toLowerCase());
  const mergedRestaurants = mergeByKey<any>(
    dbRestaurants.map(stripRestaurantRelations),
    getStoredRestaurants().map(stripRestaurantRelations),
    (r) => r.id
  );

  // Đối soát: mỗi quán có đúng 1 chủ quán, mỗi chủ quán có 1 hồ sơ quán
  const synced = reconcileAccounts(mergedUsers, mergedRestaurants);
  const users = synced.users;
  const restaurants = synced.restaurants;

  // Lưu lại kết quả đồng bộ để các trang khác (Món ngon, Chủ quán) thấy cùng số liệu
  try {
    const cleanRestaurants = restaurants.map(stripRestaurantRelations);
    if (JSON.stringify(users) !== JSON.stringify(getStoredUsers())) saveStoredUsers(users);
    if (JSON.stringify(cleanRestaurants) !== JSON.stringify(getStoredRestaurants())) {
      saveStoredRestaurants(cleanRestaurants);
    }
  } catch (err) {
    console.error('Không thể lưu kết quả đồng bộ tài khoản:', err);
  }

  // Lọc danh sách chủ quán chờ duyệt
  const pendingApprovals = restaurants.filter((r) => !r.isApproved || r.owner?.status === 'PENDING');

  // Thống kê tổng quan – tính từ cùng một bộ dữ liệu đã đồng bộ
  const counts = synced.counts;
  const stats = {
    totalRestaurants: counts.restaurants,
    approvedRestaurants: counts.restaurantsApproved,
    pendingRestaurants: pendingApprovals.length,
    totalMenuItems: menuItems.length,
    totalOrders: orders.length,
    totalBookings: bookings.length,
    totalUsers: counts.totalUsers,
  };

  const safeUser = (u: any) => {
    if (!u) return u;
    const { password, ...rest } = u;
    return rest;
  };

  return {
    success: true,
    stats,
    counts,
    pendingApprovals: pendingApprovals.map((r) => ({ ...r, owner: safeUser(r.owner) })),
    restaurants: restaurants.map((r) => ({ ...r, owner: safeUser(r.owner) })),
    users: users.map(safeUser),
  };
}

/**
 * Phê duyệt hồ sơ Chủ quán ăn (Chuyển User sang ACTIVE và Restaurant sang isApproved: true)
 */
export async function approveOwnerAction(userId: string, restaurantId: string) {
  await requireAdmin();

  let restaurantName = 'Quán ăn của bạn';

  try {
    // 1. Kích hoạt tài khoản người dùng
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    // 2. Kích hoạt quán ăn
    const res = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isApproved: true },
    });
    restaurantName = res.name;
  } catch {
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      upsertStoredUser({ ...user, role: 'OWNER', status: 'ACTIVE' });
    }

    const restaurants = getStoredRestaurants();
    const res = restaurants.find((r) => r.id === restaurantId);
    if (res) {
      upsertStoredRestaurant({ ...res, isApproved: true });
      restaurantName = res.name;
    }
  }

  // 3. Tự động gửi thông báo chúc mừng cho chủ quán
  const notif = {
    userId,
    title: 'Hồ sơ Chủ Quán đã được phê duyệt!',
    message: `Chúc mừng bạn! Hồ sơ quán "${restaurantName}" đã được Ban Quản trị Ea Súp chính thức phê duyệt. Bạn có thể vào Không Gian Chủ Quán để đăng thêm món và đón khách ngay.`,
    link: '/chu-quan/dashboard',
  };

  try {
    await prisma.notification.create({ data: notif });
  } catch {
    addStoredNotification(notif);
  }

  // 4. Tự động gửi Email thông báo phê duyệt kích hoạt thành công đến Gmail của Chủ Quán
  let ownerEmail = '';
  let ownerName = 'Chủ Quán';
  try {
    const ownerUser = await prisma.user.findUnique({ where: { id: userId } });
    if (ownerUser) {
      ownerEmail = ownerUser.email;
      ownerName = ownerUser.name;
    }
  } catch {
    const storedUser = getStoredUsers().find((u) => u.id === userId);
    if (storedUser) {
      ownerEmail = storedUser.email;
      ownerName = storedUser.name;
    }
  }

  if (ownerEmail) {
    sendOwnerApprovedEmail({
      ownerName,
      ownerEmail,
      restaurantName,
    }).catch(console.error);
  }

  revalidatePath('/admin/mon-ngon');
  revalidatePath('/mon-ngon');
  revalidatePath('/chu-quan/dashboard');

  return {
    success: true,
    message: `Đã phê duyệt thành công quán "${restaurantName}" và kích hoạt quyền Chủ Quán!`,
  };
}

/**
 * Từ chối phê duyệt hồ sơ quán
 */
export async function rejectOwnerAction(userId: string, restaurantId: string, reason?: string) {
  await requireAdmin();

  const reasonText = reason || 'Thông tin quán chưa đủ điều kiện hoặc thiếu giấy phép xác thực địa phương.';

  try {
    await prisma.restaurant.delete({ where: { id: restaurantId } });
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE', role: 'USER' }, // Chuyển về khách thường
    });
  } catch {
    deleteStoredRestaurant(restaurantId);
    const users = getStoredUsers();
    const u = users.find((x) => x.id === userId);
    if (u) {
      upsertStoredUser({ ...u, role: 'USER', status: 'ACTIVE' });
    }
  }

  const notif = {
    userId,
    title: 'Hồ sơ mở quán chưa được chấp thuận',
    message: `Ban Quản Trị rất tiếc thông báo hồ sơ mở quán của bạn chưa được duyệt. Lý do: ${reasonText}`,
    link: '/mon-ngon',
  };

  try {
    await prisma.notification.create({ data: notif });
  } catch {
    addStoredNotification(notif);
  }

  revalidatePath('/admin/mon-ngon');
  return { success: true, message: 'Đã từ chối và phản hồi đến người đăng ký.' };
}

/**
 * Cập nhật vai trò (Role) và trạng thái (Status) của người dùng
 */
export async function updateUserRoleStatusAction(userId: string, role: Role, status: UserStatus) {
  await requireAdmin();

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role, status },
    });
  } catch {
    const users = getStoredUsers();
    const u = users.find((x) => x.id === userId);
    if (u) {
      upsertStoredUser({ ...u, role, status });
    }
  }

  revalidatePath('/admin/mon-ngon');
  revalidatePath('/admin');
  return { success: true, message: `Đã cập nhật vai trò: ${role}, trạng thái: ${status}` };
}

/**
 * Xóa vĩnh viễn tài khoản người dùng
 */
export async function deleteUserAction(userId: string) {
  await requireAdmin();

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    deleteStoredUser(userId);
  }

  revalidatePath('/admin/mon-ngon');
  revalidatePath('/admin');
  return { success: true, message: 'Đã xóa tài khoản vĩnh viễn khỏi hệ thống.' };
}
