import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cancelStoredFoodTable } from '@/lib/storage';

// POST /api/food-tables/[id]/cancel
// Hủy bàn ăn (đánh dấu isCancelled)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu mã bàn ăn' }, { status: 400 });
    }

    let updatedTable: any;

    try {
      const updated = await (prisma as any).foodTable?.update({
        where: { id },
        data: { isCancelled: true },
      });
      if (!updated) throw new Error('Not found in DB');
      updatedTable = {
        ...updated,
        startAt: updated.startAt.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
      cancelStoredFoodTable(id);
    } catch {
      const res = cancelStoredFoodTable(id);
      if (!res.success) {
        return NextResponse.json({ success: false, message: 'Không tìm thấy bàn' }, { status: 404 });
      }
      updatedTable = res.table;
    }

    return NextResponse.json({
      success: true,
      message: 'Đã hủy bàn ăn',
      data: updatedTable,
    });
  } catch (error) {
    console.error('Lỗi khi hủy bàn ăn:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi hủy bàn ăn' }, { status: 500 });
  }
}
