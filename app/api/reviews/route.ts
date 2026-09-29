import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const body = await req.json();
    const { destinationId, rating, comment, userName, photos } = body;

    if (!destinationId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp điểm đến, số sao và nội dung cảm nhận' },
        { status: 400 }
      );
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    let review;
    try {
      review = await prisma.review.create({
        data: {
          destinationId,
          rating: numericRating,
          comment,
          userName: userName || user?.name || 'Du khách phương xa',
          userId: user?.userId || null,
          photos: photos || [],
          isApproved: true,
        },
      });
    } catch {
      // Memory mock
      review = {
        id: 'rev-' + Date.now(),
        destinationId,
        rating: numericRating,
        comment,
        userName: userName || user?.name || 'Du khách phương xa',
        userId: user?.userId || null,
        photos: photos || [],
        isApproved: true,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Gửi đánh giá thành công! Cảm ơn bạn đã lưu lại cảm xúc với Ea Súp.',
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi gửi đánh giá' },
      { status: 500 }
    );
  }
}
