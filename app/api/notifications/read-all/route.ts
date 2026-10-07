import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/guards';
import { markAllStoredNotificationsAsRead } from '@/lib/storage';

export async function PATCH(request: NextRequest) {
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
          isRead: false,
        }
      : {
          OR: [
            { userId: user.id },
            { recipientId: user.id },
          ],
          isRead: false,
        };

    try {
      await prisma.notification.updateMany({
        where: whereCondition,
        data: { isRead: true },
      });
    } catch {
      markAllStoredNotificationsAsRead(user.id, user.role);
    }

    return NextResponse.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return PATCH(request);
}
