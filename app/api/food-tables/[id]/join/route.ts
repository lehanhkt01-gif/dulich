import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { joinStoredFoodTable } from '@/lib/storage';

// POST /api/food-tables/[id]/join
// Tham gia bàn ăn
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
      const table = await (prisma as any).foodTable?.findUnique({ where: { id } });
      if (!table) {
        throw new Error('Table not found in DB, try storage');
      }

      if (table.joined >= table.capacity) {
        return NextResponse.json(
          { success: false, message: 'Bàn đã đủ người tham gia' },
          { status: 400 }
        );
      }

      const updated = await (prisma as any).foodTable?.update({
        where: { id },
        data: { joined: { increment: 1 } },
      });

      updatedTable = {
        ...updated,
        startAt: updated.startAt.toISOString(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
      joinStoredFoodTable(id);
    } catch {
      const res = joinStoredFoodTable(id);
      if (!res.success) {
        return NextResponse.json(
          { success: false, message: res.message || 'Không thể tham gia bàn' },
          { status: 400 }
        );
      }
      updatedTable = res.table;
    }

    return NextResponse.json({
      success: true,
      message: 'Tham gia bàn thành công!',
      data: updatedTable,
    });
  } catch (error) {
    console.error('Lỗi khi tham gia bàn:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi tham gia bàn' }, { status: 500 });
  }
}
