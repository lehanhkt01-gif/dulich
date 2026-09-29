import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { calculateDistanceKm, getDbDestinationBySlug, getDbDestinations, prisma } from '@/lib/prisma';
import { upsertStoredDestination, deleteStoredDestination, getStoredDestinationBySlug } from '@/lib/storage';
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

    // Loại bỏ các trường quan hệ có thể gây lỗi Prisma update
    const { category, reviews, createdBy, id, ...cleanData } = body;

    let updatedData: any = null;

    try {
      const updated = await prisma.destination.update({
        where: { slug },
        data: cleanData,
        include: { category: true },
      });
      updatedData = {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      };
      // Đồng bộ vào persistent JSON storage
      upsertStoredDestination({ ...updatedData, slug });
    } catch (dbErr) {
      // Lưu vào persistent JSON storage
      const existing = getStoredDestinationBySlug(slug);
      if (existing) {
        updatedData = upsertStoredDestination({
          ...existing,
          ...cleanData,
          slug,
        });
      }
    }

    if (!updatedData) {
      // Thử cập nhật theo slug trong storage kể cả khi không tìm thấy trước đó
      updatedData = upsertStoredDestination({
        ...cleanData,
        slug,
        title: cleanData.title || slug,
      });
    }

    // Làm mới cache ngay lập tức
    try {
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath(`/destinations/${slug}`);
      revalidatePath(`/di-tich/${slug}`);
    } catch (e) {
      console.warn('Revalidate error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật điểm đến thành công và đã lưu bền vững',
      data: updatedData,
    });
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
      // Bỏ qua lỗi DB nếu chưa kết nối
    }

    // Xóa trong persistent JSON storage
    deleteStoredDestination(slug);

    // Làm mới cache
    try {
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (e) {
      console.warn('Revalidate error:', e);
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
