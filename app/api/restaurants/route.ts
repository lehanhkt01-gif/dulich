import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStoredRestaurants, getStoredMenuItems } from '@/lib/storage';

export async function GET() {
  try {
    let restaurants: any[] = [];
    try {
      restaurants = await prisma.restaurant.findMany({
        where: { isApproved: true },
        include: {
          menuItems: { where: { isAvailable: true } },
          tables: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      const stored = getStoredRestaurants();
      const menu = getStoredMenuItems();
      restaurants = stored
        .filter((r) => r.isApproved)
        .map((r) => ({
          ...r,
          menuItems: menu.filter((m) => m.restaurantId === r.id && m.isAvailable),
        }));
    }

    return NextResponse.json({
      success: true,
      data: restaurants,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
