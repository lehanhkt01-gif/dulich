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

    const isAdmin = user.role === 'ADMIN' || user.role === 'CADRE';
    const whereCondition: any = isAdmin
      ? {
          OR: [
            { userId: user.id },
            { recipientId: user.id },
            { recipientRole: 'ADMIN' },
          ],
        }
      : {
          OR: [
            { userId: user.id },
            { recipientId: user.id },
            { recipientRole: user.role === 'OWNER' ? 'OWNER' : 'CUSTOMER' },
          ],
        };

    let notifications: any[] = [];
    try {
      notifications = await prisma.notification.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: 40,
      });
    } catch {
      notifications = getStoredNotifications(user.id, user.role).slice(0, 40);
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
    const {
      targetUserId,
      recipientRole,
      recipientId,
      title,
      message,
      content,
      link,
      linkUrl,
      type,
    } = body;

    const notifUserId = targetUserId || recipientId || user.id;
    const bodyContent = content || message;
    if (!title || !bodyContent) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin tiêu đề hoặc nội dung' },
        { status: 400 }
      );
    }

    const notifData = {
      userId: notifUserId,
      recipientRole: recipientRole || (user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER'),
      recipientId: recipientId || notifUserId,
      title,
      content: bodyContent,
      message: bodyContent,
      type: type || 'SYSTEM',
      linkUrl: linkUrl || link || null,
      link: linkUrl || link || null,
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
