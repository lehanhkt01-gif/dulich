import { NextRequest, NextResponse } from 'next/server';
import { calculateDistanceKm, deleteMemoryDestination, getDbDestinationBySlug, getDbDestinations, prisma, updateMemoryDestination } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';

interface Context {
  params: Promise<{ slug: string }>;
}

// GET /api/destinations/[slug]
// Lấy chi tiết bài viết, audio, gallery, và tìm các điểm lân cận trong bán kính 10km
export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { slug } = await params;
    const destination = await getDbDestinationBySlug(slug);

    if (!destination) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy điểm đến yêu cầu' },
        { status: 404 }
      );
    }

    // Tìm các điểm lân cận trong bán kính 10km
    const allDestinations = await getDbDestinations();
    const nearby = allDestinations
      .filter((d) => d.id !== destination.id)
      .map((d) => ({
        ...d,
        distanceKm: calculateDistanceKm(
          destination.latitude,
          destination.longitude,
          d.latitude,
          d.longitude
        ),
      }))
      .filter((d) => d.distanceKm <= 10)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,
      data: destination,
      nearby,
    });
  } catch (error) {
    console.error('Error fetching destination by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ khi lấy chi tiết điểm đến' },
      { status: 500 }
    );
  }
}

// PUT /api/destinations/[slug]
// Cập nhật điểm đến (Protected: EDITOR hoặc ADMIN)
export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const user = getAuthUser(req);
    if (user && !requireRole(user, ['EDITOR', 'ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối' },
        { status: 403 }
      );
    }

    const { slug } = await params;
    const body = await req.json();

    try {
      const updated = await prisma.destination.update({
        where: { slug },
        data: body,
        include: { category: true },
      });

      return NextResponse.json({
        success: true,
        message: 'Cập nhật điểm đến thành công',
        data: updated,
      });
    } catch {
      // Memory fallback
      const existing = await getDbDestinationBySlug(slug);
      if (existing) {
        updateMemoryDestination(existing.id, body);
        return NextResponse.json({
          success: true,
          message: 'Cập nhật thành công (in-memory)',
          data: { ...existing, ...body },
        });
      }
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy điểm đến để cập nhật' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating destination:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật' },
      { status: 500 }
    );
  }
}

// DELETE /api/destinations/[slug]
// Xóa điểm đến (Protected: Chỉ ADMIN)
export async function DELETE(req: NextRequest, { params }: Context) {
  try {
    const user = getAuthUser(req);
    if (user && !requireRole(user, ['ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (ADMIN) mới có quyền xóa điểm đến' },
        { status: 403 }
      );
    }

    const { slug } = await params;

    try {
      await prisma.destination.delete({
        where: { slug },
      });
    } catch {
      const existing = await getDbDestinationBySlug(slug);
      if (existing) {
        deleteMemoryDestination(existing.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa điểm đến thành công',
    });
  } catch (error) {
    console.error('Error deleting destination:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa' },
      { status: 500 }
    );
  }
}
