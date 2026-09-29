import { NextResponse } from 'next/server';
import { getDbItineraries } from '@/lib/prisma';

// GET /api/itineraries
export async function GET() {
  try {
    const itineraries = await getDbItineraries();
    return NextResponse.json({
      success: true,
      data: itineraries,
    });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải lịch trình gợi ý' },
      { status: 500 }
    );
  }
}
