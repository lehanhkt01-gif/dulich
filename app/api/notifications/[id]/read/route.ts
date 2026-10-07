import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/actions/guards';
import { markStoredNotificationAsRead } from '@/lib/storage';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Chưa đăng nhập' },
        { status: 401 }
      );
    }

    try {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
    } catch {
      markStoredNotificationAsRead(id);
    }

    return NextResponse.json({ success: true, message: 'Đã đánh dấu đã đọc' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
