import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStoredRestaurantById, toggleStoredRestaurantPin } from '@/lib/storage';
import { getCurrentUser } from '@/actions/guards';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Kiểm tra quyền: Chỉ ADMIN, CADRE, EDITOR được phép ghim quán
    if (!user || !['ADMIN', 'CADRE', 'EDITOR'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền thực hiện thao tác này' },
        { status: 403 }
      );
    }

    let updatedRestaurant: any = null;
    try {
      const existing = await prisma.restaurant.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy quán ăn' },
          { status: 404 }
        );
      }

      const nextPinned = !existing.isPinned;
      updatedRestaurant = await prisma.restaurant.update({
        where: { id },
        data: {
          isPinned: nextPinned,
          pinnedAt: nextPinned ? new Date() : null,
        },
      });
    } catch {
      // Fallback JSON Storage
      const toggled = toggleStoredRestaurantPin(id);
      if (!toggled) {
        return NextResponse.json(
          { success: false, message: 'Không tìm thấy quán ăn' },
          { status: 404 }
        );
      }
      updatedRestaurant = toggled;
    }

    revalidatePath('/');
    revalidatePath('/mon-ngon');
    revalidatePath('/admin');

    return NextResponse.json({
      success: true,
      message: updatedRestaurant.isPinned
        ? `Đã ghim quán "${updatedRestaurant.name}" lên đầu trang chủ!`
        : `Đã bỏ ghim quán "${updatedRestaurant.name}".`,
      data: updatedRestaurant,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xử lý hệ thống' },
      { status: 500 }
    );
  }
}
