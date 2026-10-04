import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteStoredFoodTable, getStoredFoodTables } from '@/lib/storage';

// GET /api/food-tables/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let table: any = null;

    try {
      const dbTable = await (prisma as any).foodTable?.findUnique({ where: { id } });
      if (dbTable) {
        table = {
          ...dbTable,
          startAt: dbTable.startAt.toISOString(),
          createdAt: dbTable.createdAt.toISOString(),
          updatedAt: dbTable.updatedAt.toISOString(),
        };
      }
    } catch {
      const items = getStoredFoodTables();
      table = items.find((t) => t.id === id) || null;
    }

    if (!table) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bàn' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin bàn:', error);
    return NextResponse.json({ success: false, message: 'Lỗi máy chủ' }, { status: 500 });
  }
}

// DELETE /api/food-tables/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = getStoredFoodTables();
    const existing = items.find((t) => t.id === id);

    try {
      await (prisma as any).foodTable?.delete({ where: { id } });
    } catch {
      // Bỏ qua nếu DB không kết nối
    }

    deleteStoredFoodTable(id);

    return NextResponse.json({ success: true, message: 'Đã xóa bàn thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa bàn:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi xóa bàn' }, { status: 500 });
  }
}
