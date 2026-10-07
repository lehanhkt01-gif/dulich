'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from './guards';
import {
  getStoredOrders,
  upsertStoredOrder,
  updateStoredOrderStatus,
  getStoredBookings,
  upsertStoredBooking,
  updateStoredBookingStatus,
  getStoredRestaurants,
  getStoredUsers,
  getStoredNotifications,
  markStoredNotificationAsRead,
  addStoredNotification,
} from '@/lib/storage';
import { sendOrderPlacedEmails } from '@/lib/email';
import { revalidatePath } from 'next/cache';

/**
 * Khách hàng tạo đơn đặt món
 */
export async function createOrderAction(data: {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ menuItemId: string; quantity: number; price: number; name?: string }>;
  note?: string;
}) {
  const user = await requireAuth();

  if (!data.customerName || !data.customerPhone) {
    return { success: false, message: 'Vui lòng điền họ tên và số điện thoại nhận đơn.' };
  }

  if (!data.items || data.items.length === 0) {
    return { success: false, message: 'Vui lòng chọn ít nhất một món ăn thơm ngon.' };
  }

  const totalAmount = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let createdOrder: any = null;
  const orderData = {
    restaurantId: data.restaurantId,
    userId: user.id,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    totalAmount,
    note: data.note || '',
    status: 'PENDING' as const,
    orderItems: data.items.map((i) => ({
      id: `oi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: '',
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      price: i.price,
    })),
  };

  try {
    createdOrder = await prisma.order.create({
      data: {
        restaurantId: data.restaurantId,
        userId: user.id,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalAmount,
        note: data.note || '',
        status: 'PENDING',
        orderItems: {
          create: data.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
    });
  } catch {
    createdOrder = upsertStoredOrder(orderData);
  }

  // Thông báo và Gửi Email đến Chủ quán ăn & Khách hàng
  try {
    let restaurant: any = null;
    try {
      restaurant = await prisma.restaurant.findUnique({ where: { id: data.restaurantId } });
    } catch {
      restaurant = getStoredRestaurants().find((r) => r.id === data.restaurantId);
    }

    let ownerEmail = '';
    if (restaurant?.ownerId) {
      try {
        const owner = await prisma.user.findUnique({ where: { id: restaurant.ownerId } });
        ownerEmail = owner?.email || '';
      } catch {
        const storedOwner = getStoredUsers().find((u) => u.id === restaurant.ownerId);
        ownerEmail = storedOwner?.email || '';
      }

      const notifData = {
        userId: restaurant.ownerId,
        title: 'Có đơn đặt món mới cần duyệt!',
        message: `Khách ${data.customerName} (SĐT: ${data.customerPhone}) vừa đặt món với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}đ. Vui lòng kiểm tra và phê duyệt.`,
        link: '/chu-quan/dashboard',
      };
      try {
        await prisma.notification.create({ data: notifData });
      } catch {
        addStoredNotification(notifData);
      }
    }

    // Gửi email tự động ngay lập tức cho Khách hàng và Chủ quán
    sendOrderPlacedEmails({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: user.email,
      ownerEmail,
      restaurantName: restaurant?.name || 'Quán ăn Ea Súp',
      totalAmount,
      items: data.items,
      note: data.note,
    }).catch(console.error);
  } catch {}

  revalidatePath('/mon-ngon/lich-su-dat');
  revalidatePath('/chu-quan/dashboard');

  return {
    success: true,
    message: 'Đặt món thành công! Đơn hàng đang được gửi đến chủ quán để phê duyệt.',
    orderId: createdOrder.id,
  };
}

/**
 * Khách hàng đặt bàn trước
 */
export async function createBookingAction(data: {
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  bookingTime: string;
  guestCount: number;
  tableId?: string;
  note?: string;
}) {
  const user = await requireAuth();

  if (!data.customerName || !data.customerPhone || !data.bookingTime) {
    return { success: false, message: 'Vui lòng cung cấp đầy đủ thông tin đặt bàn và giờ đến ăn.' };
  }

  const bookingData = {
    restaurantId: data.restaurantId,
    userId: user.id,
    tableId: data.tableId || null,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    bookingTime: new Date(data.bookingTime).toISOString(),
    guestCount: Number(data.guestCount) || 2,
    status: 'PENDING' as const,
    note: data.note || '',
  };

  let createdBooking: any = null;
  try {
    createdBooking = await prisma.booking.create({
      data: {
        ...bookingData,
        bookingTime: new Date(bookingData.bookingTime),
      },
    });
  } catch {
    createdBooking = upsertStoredBooking(bookingData);
  }

  // Báo cho chủ quán
  try {
    let restaurant: any = null;
    try {
      restaurant = await prisma.restaurant.findUnique({ where: { id: data.restaurantId } });
    } catch {
      restaurant = getStoredRestaurants().find((r) => r.id === data.restaurantId);
    }
    if (restaurant?.ownerId) {
      const notifData = {
        userId: restaurant.ownerId,
        title: 'Có khách đặt bàn trước mới!',
        message: `Khách ${data.customerName} (SĐT: ${data.customerPhone}) vừa đặt bàn cho ${data.guestCount} người vào lúc ${new Date(data.bookingTime).toLocaleString('vi-VN')}.`,
        link: '/chu-quan/dashboard',
      };
      try {
        await prisma.notification.create({ data: notifData });
      } catch {
        addStoredNotification(notifData);
      }
    }
  } catch {}

  revalidatePath('/mon-ngon/lich-su-dat');
  revalidatePath('/chu-quan/dashboard');

  return {
    success: true,
    message: 'Đặt bàn thành công! Quán sẽ xác nhận lịch hẹn của bạn trong thời gian sớm nhất.',
    bookingId: createdBooking.id,
  };
}

/**
 * Lấy danh sách Đơn đặt món & Đặt bàn của chính người dùng hiện tại
 * BẢO MẬT: Chỉ lấy bản ghi có userId === user.id!
 */
export async function getCustomerOrdersAndBookings() {
  const user = await requireAuth();

  let orders: any[] = [];
  let bookings: any[] = [];

  try {
    orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        restaurant: true,
        orderItems: { include: { menuItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        restaurant: true,
        table: true,
      },
      orderBy: { bookingTime: 'desc' },
    });
  } catch {
    orders = getStoredOrders(undefined, user.id);
    bookings = getStoredBookings(undefined, user.id);
  }

  // Bổ sung thông tin restaurant nếu chưa có
  const allRes = getStoredRestaurants();
  orders = orders.map((o) => {
    if (!o.restaurant) {
      o.restaurant = allRes.find((r) => r.id === o.restaurantId);
    }
    return o;
  });
  bookings = bookings.map((b) => {
    if (!b.restaurant) {
      b.restaurant = allRes.find((r) => r.id === b.restaurantId);
    }
    return b;
  });

  return {
    success: true,
    orders,
    bookings,
  };
}

/**
 * Khách tự hủy đơn khi trạng thái còn PENDING
 */
export async function cancelOrderAction(orderId: string) {
  const user = await requireAuth();

  try {
    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order || order.userId !== user.id) {
        return { success: false, message: 'Bạn không có quyền thao tác trên đơn hàng này.' };
      }
      if (order.status !== 'PENDING') {
        return { success: false, message: 'Đơn hàng đã được quán xử lý, không thể tự hủy lúc này.' };
      }

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });
    } catch {
      const order = getStoredOrders().find((o) => o.id === orderId);
      if (!order || order.userId !== user.id) {
        return { success: false, message: 'Bạn không có quyền thao tác trên đơn hàng này.' };
      }
      if (order.status !== 'PENDING') {
        return { success: false, message: 'Đơn hàng đã được quán xử lý, không thể tự hủy lúc này.' };
      }
      updateStoredOrderStatus(orderId, 'CANCELLED');
    }

    revalidatePath('/mon-ngon/lich-su-dat');
    revalidatePath('/chu-quan/dashboard');

    // Báo cho chủ quán biết khách đã hủy đơn
    try {
      let restaurantId = '';
      try {
        const o = await prisma.order.findUnique({ where: { id: orderId } });
        restaurantId = o?.restaurantId || '';
      } catch {
        const o = getStoredOrders().find((x) => x.id === orderId);
        restaurantId = o?.restaurantId || '';
      }
      if (restaurantId) {
        const r = getStoredRestaurants().find((x) => x.id === restaurantId);
        if (r?.ownerId) {
          const notifData = {
            userId: r.ownerId,
            title: 'Khách hàng vừa hủy đơn đặt món',
            message: `Khách hàng ${user.name || 'Du khách'} vừa hủy đơn đặt món #${orderId.slice(-6)}.`,
            type: 'CANCEL',
            link: '/chu-quan/dashboard',
          };
          try {
            await prisma.notification.create({ data: notifData });
          } catch {
            addStoredNotification(notifData);
          }
        }
      }
    } catch {}

    return { success: true, message: 'Đã hủy đơn đặt món thành công.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi hủy đơn' };
  }
}

/**
 * Khách tự hủy đặt bàn khi còn PENDING
 */
export async function cancelBookingAction(bookingId: string) {
  const user = await requireAuth();

  try {
    let restaurantId = '';
    let customerName = user.name || 'Du khách';

    try {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.userId !== user.id) {
        return { success: false, message: 'Bạn không có quyền thao tác trên đặt bàn này.' };
      }
      if (booking.status !== 'PENDING') {
        return { success: false, message: 'Lịch đặt bàn đã được quán duyệt, vui lòng liên hệ quán nếu muốn hủy.' };
      }
      restaurantId = booking.restaurantId;
      customerName = booking.customerName || customerName;

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });
    } catch {
      const booking = getStoredBookings().find((b) => b.id === bookingId);
      if (!booking || booking.userId !== user.id) {
        return { success: false, message: 'Bạn không có quyền thao tác trên đặt bàn này.' };
      }
      if (booking.status !== 'PENDING') {
        return { success: false, message: 'Lịch đặt bàn đã được quán duyệt.' };
      }
      restaurantId = booking.restaurantId;
      customerName = booking.customerName || customerName;
      updateStoredBookingStatus(bookingId, 'CANCELLED');
    }

    // Báo cho chủ quán
    if (restaurantId) {
      try {
        const r = getStoredRestaurants().find((x) => x.id === restaurantId);
        if (r?.ownerId) {
          const notifData = {
            userId: r.ownerId,
            title: 'Khách hàng vừa hủy lịch đặt bàn',
            message: `Khách hàng ${customerName} vừa hủy lịch đặt bàn.`,
            type: 'CANCEL',
            link: '/chu-quan/dashboard',
          };
          try {
            await prisma.notification.create({ data: notifData });
          } catch {
            addStoredNotification(notifData);
          }
        }
      } catch {}
    }

    revalidatePath('/mon-ngon/lich-su-dat');
    revalidatePath('/chu-quan/dashboard');
    return { success: true, message: 'Đã hủy lịch đặt bàn thành công.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Lỗi khi hủy đặt bàn' };
  }
}

/**
 * Lấy danh sách thông báo của người dùng
 */
export async function getCustomerNotificationsAction() {
  const user = await requireAuth();
  let notifs: any[] = [];
  try {
    notifs = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  } catch {
    notifs = getStoredNotifications(user.id);
  }
  return { success: true, notifications: notifs };
}

/**
 * Đánh dấu đã đọc thông báo
 */
export async function markNotificationAsReadAction(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  } catch {
    markStoredNotificationAsRead(id);
  }
  return { success: true };
}
