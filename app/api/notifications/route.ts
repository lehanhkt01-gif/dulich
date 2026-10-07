import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/guards';
import { getStoredNotifications, addStoredNotification } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    let notifications: any[] = [];
    try {
      notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
    } catch {
      notifications = getStoredNotifications(user.id).slice(0, 30);
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy thông báo' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetUserId, title, message, link, type } = body;

    const notifUserId = targetUserId || user.id;
    if (!title || !message) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin tiêu đề hoặc nội dung' },
        { status: 400 }
      );
    }

    const notifData = {
      userId: notifUserId,
      title,
      message,
      type: type || 'SYSTEM',
      link: link || null,
      isRead: false,
    };

    let created: any = null;
    try {
      created = await prisma.notification.create({ data: notifData });
    } catch {
      created = addStoredNotification(notifData);
    }

    return NextResponse.json({
      success: true,
      notification: created,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
