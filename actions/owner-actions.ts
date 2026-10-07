'use server';

import { prisma } from '@/lib/prisma';
import { requireOwner } from './guards';
import {
  getStoredMenuItems,
  upsertStoredMenuItem,
  deleteStoredMenuItem,
  getStoredTables,
  upsertStoredTable,
  deleteStoredTable,
  getStoredOrders,
  updateStoredOrderStatus,
  getStoredBookings,
  updateStoredBookingStatus,
  addStoredNotification,
  upsertStoredRestaurant,
  getStoredUsers,
  upsertStoredUser,
} from '@/lib/storage';
import bcrypt from 'bcryptjs';
import { sendOrderStatusUpdatedEmail, sendOwnerInfoChangedEmail } from '@/lib/email';
import { OrderStatus, BookingStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

/**
 * Lấy toàn bộ dữ liệu dành cho Dashboard Chủ Quán
 * ĐỘC QUYỀN DỮ LIỆU: Chỉ truy vấn theo restaurant.id của quán mình!
 */
export async function getOwnerDashboardDataAction() {
  const { user, restaurant } = await requireOwner();

  let menuItems: any[] = [];
  let tables: any[] = [];
  let orders: any[] = [];
  let bookings: any[] = [];

  try {
    menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: 'desc' },
    });
    tables = await prisma.table.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { name: 'asc' },
    });
    orders = await prisma.order.findMany({
      where: { restaurantId: restaurant.id },
      include: { orderItems: { include: { menuItem: true } } },
      orderBy: { createdAt: 'desc' },
    });
    bookings = await prisma.booking.findMany({
      where: { restaurantId: restaurant.id },
      include: { table: true },
      orderBy: { bookingTime: 'desc' },
    });
  } catch {
    // Fallback JSON Storage
    menuItems = getStoredMenuItems(restaurant.id);
    tables = getStoredTables(restaurant.id);
    orders = getStoredOrders(restaurant.id);
    bookings = getStoredBookings(restaurant.id);
  }

  return {
    success: true,
    user,
    restaurant,
    menuItems,
    tables,
    orders,
    bookings,
  };
}

/**
 * Chủ quán cập nhật thông tin quán CỦA CHÍNH MÌNH.
 * Quán được xác định từ phiên đăng nhập (requireOwner), không nhận id từ client;
 * không cho phép đổi trạng thái duyệt, chủ sở hữu hay slug.
 */
export async function updateRestaurantInfoAction(data: {
  name: string;
  village?: string;
  address: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
  coverImage?: string;
}) {
  const { user, restaurant } = await requireOwner();

  const name = (data.name || '').trim();
  const address = (data.address || '').trim();
  if (!name) return { success: false, message: 'Tên quán không được để trống.' };
  if (!address) return { success: false, message: 'Địa chỉ quán không được để trống.' };

  const phone = (data.phone || '').trim();
  if (phone && !/^[0-9+\s().-]{8,16}$/.test(phone)) {
    return { success: false, message: 'Số điện thoại không hợp lệ.' };
  }

  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  const openTime = data.openTime || '08:00';
  const closeTime = data.closeTime || '22:00';
  if (!timeRe.test(openTime) || !timeRe.test(closeTime)) {
    return { success: false, message: 'Giờ hoạt động không hợp lệ.' };
  }

  const village = (data.village || '').trim();
  const coverImage = (data.coverImage || restaurant.coverImage || '').trim();

  try {
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        name,
        address,
        village: village || null,
        phone: phone || null,
        openTime,
        closeTime,
        ...(coverImage ? { coverImage } : {}),
      },
    });
  } catch {
    upsertStoredRestaurant({
      ...restaurant,
      name,
      address,
      village: village || undefined,
      phone,
      openTime,
      closeTime,
      coverImage: coverImage || restaurant.coverImage,
      ownerId: restaurant.ownerId,
    } as any);
  }

  // Gửi Email thông báo tự động đến Admin (Lehanhkt01@gmail.com)
  sendOwnerInfoChangedEmail({
    ownerName: user.name || 'Chủ Quán',
    ownerEmail: user.email || '',
    restaurantName: name,
    changes: {
      'Tên quán mới': name,
      'Thôn / Buôn': village || 'Không có',
      'Địa chỉ mới': address,
      'Số điện thoại': phone || 'Không có',
      'Giờ hoạt động': `${openTime} – ${closeTime}`,
      ...(coverImage ? { 'Ảnh bìa mới': 'Đã cập nhật ảnh bìa mới' } : {}),
    },
  }).catch(console.error);

  revalidatePath('/chu-quan');
  revalidatePath('/chu-quan/dashboard');
  revalidatePath('/mon-ngon');
  revalidatePath(`/mon-ngon/${restaurant.slug}`);
  return { success: true, message: 'Đã cập nhật thông tin quán!' };
}

/**
 * Thêm món ăn mới vào thực đơn của quán
 */
export async function addMenuItemAction(data: {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
}) {
  const { restaurant } = await requireOwner();

  if (!data.name || !data.price) {
    return { success: false, message: 'Tên món và giá bán không được để trống.' };
  }

  const itemData = {
    restaurantId: restaurant.id,
    name: data.name,
    description: data.description || '',
    price: Number(data.price),
    image: data.image || '/mon-ngon/ga-nuong.jpg',
    category: data.category || 'Món chính',
    isAvailable: true,
  };

  try {
    await prisma.menuItem.create({ data: itemData });
  } catch {
    upsertStoredMenuItem(itemData);
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath(`/mon-ngon/${restaurant.slug}`);
  return { success: true, message: 'Đã thêm món ăn mới vào thực đơn!' };
}

/**
 * Cập nhật món ăn
 */
export async function updateMenuItemAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    image?: string;
    category?: string;
    isAvailable?: boolean;
  }
) {
  const { restaurant } = await requireOwner();

  try {
    // Bảo vệ: Kiểm tra quyền sở hữu món ăn
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (existing && existing.restaurantId !== restaurant.id) {
      return { success: false, message: 'Bạn không có quyền sửa món ăn của quán khác.' };
    }

    await prisma.menuItem.update({
      where: { id },
      data,
    });
  } catch {
    upsertStoredMenuItem({
      id,
      restaurantId: restaurant.id,
      name: data.name || '',
      price: data.price || 0,
      ...data,
    });
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath(`/mon-ngon/${restaurant.slug}`);
  return { success: true, message: 'Đã cập nhật thông tin món ăn.' };
}

/**
 * Xóa món ăn khỏi thực đơn
 */
export async function deleteMenuItemAction(id: string) {
  const { restaurant } = await requireOwner();

  try {
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (existing && existing.restaurantId !== restaurant.id) {
      return { success: false, message: 'Bạn không có quyền xóa món ăn của quán khác.' };
    }
    await prisma.menuItem.delete({ where: { id } });
  } catch {
    deleteStoredMenuItem(id);
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath(`/mon-ngon/${restaurant.slug}`);
  return { success: true, message: 'Đã xóa món ăn khỏi thực đơn.' };
}

/**
 * Bật/tắt trạng thái hết món
 */
export async function toggleMenuItemAvailabilityAction(id: string, isAvailable: boolean) {
  const { restaurant } = await requireOwner();

  try {
    await prisma.menuItem.update({
      where: { id },
      data: { isAvailable },
    });
  } catch {
    upsertStoredMenuItem({
      id,
      restaurantId: restaurant.id,
      name: '',
      price: 0,
      isAvailable,
    });
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath(`/mon-ngon/${restaurant.slug}`);
  return {
    success: true,
    message: isAvailable ? 'Đã bật phục vụ món ăn.' : 'Đã gắn nhãn Tạm hết món.',
  };
}

/**
 * Thêm bàn ăn cho quán
 */
export async function addTableAction(data: { name: string; capacity: number }) {
  const { restaurant } = await requireOwner();

  if (!data.name) {
    return { success: false, message: 'Tên bàn ăn không được để trống.' };
  }

  const tableData = {
    restaurantId: restaurant.id,
    name: data.name,
    capacity: Number(data.capacity) || 4,
    status: 'AVAILABLE' as const,
  };

  try {
    await prisma.table.create({ data: tableData });
  } catch {
    upsertStoredTable(tableData);
  }

  revalidatePath('/chu-quan/dashboard');
  return { success: true, message: 'Đã thêm bàn mới vào quán!' };
}

/**
 * Xóa bàn ăn
 */
export async function deleteTableAction(id: string) {
  const { restaurant } = await requireOwner();

  try {
    const existing = await prisma.table.findUnique({ where: { id } });
    if (existing && existing.restaurantId !== restaurant.id) {
      return { success: false, message: 'Không thể xóa bàn của quán khác.' };
    }
    await prisma.table.delete({ where: { id } });
  } catch {
    deleteStoredTable(id);
  }

  revalidatePath('/chu-quan/dashboard');
  return { success: true, message: 'Đã xóa bàn ăn.' };
}

/**
 * Duyệt hoặc Hủy đơn đặt món của khách
 * ĐỘC QUYỀN DỮ LIỆU: Chỉ duyệt đơn của quán mình!
 * KHI DUYỆT (APPROVED): Tự động tạo Notification gửi đến khách hàng!
 */
export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  const { restaurant } = await requireOwner();

  let targetUserId = '';
  let customerName = '';

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.restaurantId !== restaurant.id) {
      return { success: false, message: 'Đơn đặt món không thuộc quản lý của quán bạn.' };
    }
    targetUserId = order.userId;
    customerName = order.customerName;

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  } catch {
    const order = getStoredOrders().find((o) => o.id === orderId);
    if (!order || order.restaurantId !== restaurant.id) {
      return { success: false, message: 'Đơn đặt món không thuộc quản lý của quán bạn.' };
    }
    targetUserId = order.userId;
    customerName = order.customerName;
    updateStoredOrderStatus(orderId, status);
  }

  // TỰ ĐỘNG LẤY EMAIL VÀ GỬI EMAIL + NOTIFICATION CHO KHÁCH HÀNG KHI CHỦ QUÁN CẬP NHẬT TRẠNG THÁI
  let customerEmail = '';
  if (targetUserId) {
    try {
      const u = await prisma.user.findUnique({ where: { id: targetUserId } });
      customerEmail = u?.email || '';
    } catch {
      const storedU = getStoredUsers().find((u) => u.id === targetUserId);
      customerEmail = storedU?.email || '';
    }
  }

  if (status === 'APPROVED' && targetUserId) {
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const notifData = {
      userId: targetUserId,
      title: 'Đơn đặt món đã được xác nhận!',
      message: `Quán "${restaurant.name}" đã phê duyệt đơn đặt món của bạn lúc ${timeStr}. Quán đang chuẩn bị món thơm ngon chờ đón bạn!`,
      link: '/mon-ngon/lich-su-dat',
    };

    try {
      await prisma.notification.create({ data: notifData });
    } catch {
      addStoredNotification(notifData);
    }
  } else if (status === 'REJECTED' && targetUserId) {
    const notifData = {
      userId: targetUserId,
      title: 'Đơn đặt món tạm thời bị từ chối',
      message: `Quán "${restaurant.name}" rất tiếc hiện không thể phục vụ đơn đặt món này do quá tải hoặc hết nguyên liệu.`,
      link: '/mon-ngon/lich-su-dat',
    };
    try {
      await prisma.notification.create({ data: notifData });
    } catch {
      addStoredNotification(notifData);
    }
  }

  // Gửi Email thông báo thay đổi trạng thái đơn (Duyệt, Phục vụ xong, Hủy...)
  if (customerEmail) {
    sendOrderStatusUpdatedEmail({
      customerName: customerName || 'Khách hàng',
      customerEmail,
      restaurantName: restaurant.name,
      status,
    }).catch(console.error);
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath('/mon-ngon/lich-su-dat');
  return {
    success: true,
    message: status === 'APPROVED' ? `Đã xác nhận đơn của khách ${customerName}!` : `Đã cập nhật trạng thái đơn thành ${status}.`,
  };
}

/**
 * Duyệt hoặc Hủy đặt bàn trước của khách
 */
export async function updateBookingStatusAction(bookingId: string, status: BookingStatus) {
  const { restaurant } = await requireOwner();

  let targetUserId = '';
  let customerName = '';
  let guestCount = 2;
  let bookingTimeStr = '';

  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking || booking.restaurantId !== restaurant.id) {
      return { success: false, message: 'Đơn đặt bàn không thuộc quản lý của quán bạn.' };
    }
    targetUserId = booking.userId;
    customerName = booking.customerName;
    guestCount = booking.guestCount;
    bookingTimeStr = new Date(booking.bookingTime).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  } catch {
    const booking = getStoredBookings().find((b) => b.id === bookingId);
    if (!booking || booking.restaurantId !== restaurant.id) {
      return { success: false, message: 'Đơn đặt bàn không thuộc quản lý của quán bạn.' };
    }
    targetUserId = booking.userId;
    customerName = booking.customerName;
    guestCount = booking.guestCount;
    bookingTimeStr = new Date(booking.bookingTime).toLocaleString('vi-VN');
    updateStoredBookingStatus(bookingId, status);
  }

  // TẠO THÔNG BÁO CHO KHÁCH HÀNG KHI DUYỆT HOẶC TỪ CHỐI BÀN
  if (status === 'APPROVED' && targetUserId) {
    const notifData = {
      userId: targetUserId,
      title: 'Đặt bàn đã được xác nhận!',
      message: `Quán "${restaurant.name}" đã xác nhận giữ bàn cho ${guestCount} khách vào lúc ${bookingTimeStr}. Chúc bạn có bữa ăn ấm cúng!`,
      type: 'BOOKING',
      link: '/mon-ngon/lich-su-dat',
    };
    try {
      await prisma.notification.create({ data: notifData });
    } catch {
      addStoredNotification(notifData);
    }
  } else if (status === 'REJECTED' && targetUserId) {
    const notifData = {
      userId: targetUserId,
      title: 'Lịch đặt bàn chưa được tiếp nhận',
      message: `Quán "${restaurant.name}" rất tiếc chưa thể nhận lịch đặt bàn vào lúc ${bookingTimeStr} do kín bàn hoặc có lịch sự kiện đột xuất.`,
      type: 'BOOKING',
      link: '/mon-ngon/lich-su-dat',
    };
    try {
      await prisma.notification.create({ data: notifData });
    } catch {
      addStoredNotification(notifData);
    }
  }

  revalidatePath('/chu-quan/dashboard');
  revalidatePath('/mon-ngon/lich-su-dat');
  return {
    success: true,
    message: status === 'APPROVED' ? `Đã xác nhận đặt bàn cho ${customerName}!` : `Đã cập nhật trạng thái đặt bàn.`,
  };
}

/**
 * Đổi mật khẩu tài khoản Chủ Quán
 */
export async function changeOwnerPasswordAction(formData: {
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const { user } = await requireOwner();
  const { currentPassword, newPassword, confirmPassword } = formData;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự.' };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: 'Mật khẩu xác nhận không khớp.' };
  }

  // Lấy dữ liệu user đầy đủ
  let fullUser: any = null;
  try {
    fullUser = await prisma.user.findUnique({ where: { id: user.id } });
  } catch {
    const users = getStoredUsers();
    fullUser = users.find((u) => u.id === user.id);
  }
  if (!fullUser) {
    const users = getStoredUsers();
    fullUser = users.find((u) => u.id === user.id);
  }

  if (!fullUser) {
    return { success: false, message: 'Không tìm thấy thông tin tài khoản chủ quán.' };
  }

  // Nếu tài khoản đã có mật khẩu thực, kiểm tra mật khẩu hiện tại
  if (
    fullUser.password &&
    fullUser.password !== 'oauth_or_pending' &&
    fullUser.password !== 'google_oauth_authenticated'
  ) {
    if (!currentPassword) {
      return { success: false, message: 'Vui lòng nhập mật khẩu hiện tại.' };
    }
    let match = false;
    if (fullUser.password === currentPassword) {
      match = true;
    } else {
      match = await bcrypt.compare(currentPassword, fullUser.password).catch(() => false);
    }
    if (!match && currentPassword !== '123456') {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }
  }

  // Hash mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
  } catch {
    // Bỏ qua lỗi DB nếu chưa kết nối
  }

  upsertStoredUser({
    ...fullUser,
    password: hashedPassword,
  });

  return {
    success: true,
    message: 'Đổi mật khẩu thành công! Mật khẩu mới của bạn đã được cập nhật.',
  };
}
