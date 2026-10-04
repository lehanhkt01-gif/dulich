import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStoredRestaurants, getStoredMenuItems } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    let restaurant: any = null;
    let menuItems: any[] = [];

    try {
      restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
          menuItems: { where: { isAvailable: true } },
          tables: true,
        },
      });
      if (restaurant) {
        menuItems = restaurant.menuItems;
      }
    } catch {
      const allRes = getStoredRestaurants();
      restaurant = allRes.find((r) => r.slug === slug || r.id === slug);
      if (restaurant) {
        menuItems = getStoredMenuItems(restaurant.id);
      }
    }

    if (!restaurant) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy quán' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      restaurant,
      menuItems,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
