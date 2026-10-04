import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, canManageEntity } from '@/lib/auth';
import { getStoredDishById, upsertStoredDish, deleteStoredDish } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dish = getStoredDishById(id);
    if (!dish) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: dish });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = getStoredDishById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền: Chỉ ADMIN hoặc Chủ quán sở hữu món mới được sửa
    if (!canManageEntity(user, existing.ownerId)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền chỉnh sửa món ăn này (chỉ chủ quán tạo món hoặc Admin mới có quyền)' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = upsertStoredDish({
      ...existing,
      ...body,
      id,
      ownerId: existing.ownerId, // Không đổi quyền sở hữu
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật món ăn thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = getStoredDishById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy món ăn' },
        { status: 404 }
      );
    }

    // Kiểm tra quyền: Chỉ ADMIN hoặc Chủ quán sở hữu món mới được xóa
    if (!canManageEntity(user, existing.ownerId)) {
      return NextResponse.json(
        { success: false, message: 'Bạn không có quyền xóa món ăn của quán khác (chỉ chủ quán tạo món hoặc Admin mới có quyền)' },
        { status: 403 }
      );
    }

    deleteStoredDish(id);

    return NextResponse.json({
      success: true,
      message: 'Đã xóa món ăn thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi xóa món: ' + error.message },
      { status: 500 }
    );
  }
}
