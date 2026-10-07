import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStoredUsers, getStoredRestaurants } from '@/lib/storage';
import { computeCounts, mergeByKey, stripRestaurantRelations } from '@/lib/account-sync';

export async function GET() {
  try {
    let dbUsers: any[] = [];
    let dbRestaurants: any[] = [];
    try {
      dbUsers = await prisma.user.findMany();
    } catch {}
    try {
      dbRestaurants = await prisma.restaurant.findMany();
    } catch {}

    const mergedUsers = mergeByKey<any>(dbUsers, getStoredUsers(), (u) => u.email?.toLowerCase());
    const mergedRestaurants = mergeByKey<any>(
      dbRestaurants.map(stripRestaurantRelations),
      getStoredRestaurants(),
      (r) => r.slug
    );

    const counts = computeCounts(mergedUsers, mergedRestaurants);

    return NextResponse.json({
      success: true,
      customerCount: counts.customers,
      ownerCount: counts.owners,
      staffCount: counts.cadres,
      counts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
