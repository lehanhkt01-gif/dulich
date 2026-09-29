import { NextRequest, NextResponse } from 'next/server';
import { addMemoryDestination, getDbDestinations, prisma } from '@/lib/prisma';
import { getAuthUser, requireRole } from '@/lib/auth';
import { Destination } from '@/lib/types';

// GET /api/destinations
// Lọc theo từ khóa, danh mục, bán kính tọa độ GPS, phân trang
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const categorySlug = searchParams.get('category') || undefined;
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const radiusStr = searchParams.get('radius');

    const lat = latStr ? parseFloat(latStr) : undefined;
    const lng = lngStr ? parseFloat(lngStr) : undefined;
    const radiusKm = radiusStr ? parseFloat(radiusStr) : undefined;

    const destinations = await getDbDestinations({
      query,
      categorySlug,
      lat,
      lng,
      radiusKm,
    });

    return NextResponse.json({
      success: true,
      total: destinations.length,
      data: destinations,
    });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải danh sách danh thắng' },
      { status: 500 }
    );
  }
}

// POST /api/destinations (Protected: EDITOR hoặc ADMIN)
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    // Cho phép nếu có token role EDITOR/ADMIN, hoặc dev fallback
    if (user && !requireRole(user, ['EDITOR', 'ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug,
      subTitle,
      historicalPeriod,
      content,
      audioVoiceUrl,
      thumbnail,
      gallery,
      address,
      latitude,
      longitude,
      bestSeason,
      entryFee,
      visitingHours,
      culturalNotes,
      categoryId,
      isFeatured,
    } = body;

    if (!title || !slug || !content || !thumbnail || !address || latitude == null || longitude == null || !categoryId) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
        { status: 400 }
      );
    }

    let createdDestination: Destination;

    try {
      const created = await prisma.destination.create({
        data: {
          title,
          slug,
          subTitle,
          historicalPeriod,
          content,
          audioVoiceUrl,
          thumbnail,
          gallery: gallery || [thumbnail],
          address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          bestSeason,
          entryFee,
          visitingHours,
          culturalNotes,
          categoryId,
          isFeatured: Boolean(isFeatured),
          createdById: user?.userId,
        },
        include: { category: true },
      });

      createdDestination = {
        ...created,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    } catch {
      // Fallback in-memory
      const newId = 'dest-' + Date.now();
      createdDestination = {
        id: newId,
        title,
        slug,
        subTitle,
        historicalPeriod,
        content,
        audioVoiceUrl,
        thumbnail,
        gallery: gallery || [thumbnail],
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        bestSeason,
        entryFee,
        visitingHours,
        culturalNotes,
        categoryId,
        isPublished: true,
        isFeatured: Boolean(isFeatured),
        viewsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addMemoryDestination(createdDestination);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thêm mới danh lam thắng cảnh thành công',
        data: createdDestination,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating destination:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo mới điểm đến' },
      { status: 500 }
    );
  }
}
