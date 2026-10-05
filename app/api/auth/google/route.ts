import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signJwtToken } from '@/lib/auth';
import {
  getStoredUsers,
  upsertStoredUser,
  upsertStoredDestination,
  upsertStoredRestaurant,
} from '@/lib/storage';

/**
 * Endpoint xác thực Đăng nhập & Đăng ký bằng Google
 * Hỗ trợ cả Google ID Token (JWT) từ Google Identity Services và Mock/Sandbox Profile
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      credential,
      googleProfile,
      roleRequest, // 'TRAVELER' | 'OWNER'
      restaurantName,
      restaurantAddress,
      restaurantPhone,
      restaurantLat,
      restaurantLng,
      restaurantDesc,
      restaurantImage,
    } = body;

    let email = '';
    let name = '';
    let avatar = '';

    // 1. Phân tích token Google hoặc payload
    if (credential) {
      try {
        // Giải mã JWT payload của Google ID Token (phần giữa)
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decodedJson = JSON.parse(
            Buffer.from(payloadBase64, 'base64').toString('utf-8')
          );
          email = decodedJson.email;
          name = decodedJson.name || decodedJson.given_name || email.split('@')[0];
          avatar = decodedJson.picture || '';
        }
      } catch (err) {
        console.error('Không thể giải mã Google credential:', err);
      }
    }

    // Nếu không có credential hợp lệ, dùng googleProfile truyền lên (Sandbox / Direct Login)
    if (!email && googleProfile?.email) {
      email = googleProfile.email;
      name = googleProfile.name || email.split('@')[0];
      avatar = googleProfile.avatar || '';
    }

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Thông tin tài khoản Google không hợp lệ hoặc thiếu email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!avatar) {
      avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || normalizedEmail)}`;
    }

    // 2. Tìm kiếm người dùng hiện có trong DB hoặc Storage
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    } catch {
      const storedUsers = getStoredUsers();
      existingUser = storedUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    }

    // QUY ĐỊNH RÀNG BUỘC VAI TRÒ:
    // 1. Mail nào đã đăng ký làm chủ quán thì không được đăng ký/đăng nhập làm khách hàng nữa
    if (existingUser && existingUser.role === 'OWNER' && roleRequest !== 'OWNER') {
      return NextResponse.json(
        {
          success: false,
          message: 'Email này đã đăng ký làm chủ quán, không thể đăng ký khách hàng.',
          isOwner: true,
        },
        { status: 400 }
      );
    }

    // 2. Nhưng nếu email đó đã đăng ký làm khách hàng thì vẫn được đăng ký làm chủ quán và xóa vai trò khách hàng
    let finalRole = existingUser ? existingUser.role : (roleRequest === 'OWNER' ? 'OWNER' : 'TRAVELER');
    if (roleRequest === 'OWNER' && existingUser && (existingUser.role === 'TRAVELER' || existingUser.role === 'USER')) {
      finalRole = 'OWNER';
    }

    // Xác định trạng thái tài khoản theo quy định RBAC:
    // - Khách hàng: tự động ACTIVE ngay lập tức (không cần duyệt)
    // - Chủ quán mới: PENDING (bắt buộc phải được Admin phê duyệt mới được hoạt động)
    let finalStatus = 'ACTIVE';
    if (finalRole === 'OWNER') {
      finalStatus = existingUser?.role === 'OWNER' && existingUser?.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING';
    } else {
      finalStatus = existingUser?.status || 'ACTIVE';
    }

    // Tạo object user cập nhật
    const userData: any = {
      id: existingUser?.id || `user-google-${Date.now()}`,
      name: name || existingUser?.name || 'Du khách Ea Súp',
      email: normalizedEmail,
      role: finalRole,
      status: finalStatus,
      avatar: avatar || existingUser?.avatar,
      phone: restaurantPhone || existingUser?.phone || null,
      restaurantName: restaurantName || existingUser?.restaurantName || null,
      restaurantAddress: restaurantAddress || existingUser?.restaurantAddress || null,
      restaurantPhone: restaurantPhone || existingUser?.restaurantPhone || null,
      restaurantLat: restaurantLat ? Number(restaurantLat) : (existingUser?.restaurantLat || 13.2456),
      restaurantLng: restaurantLng ? Number(restaurantLng) : (existingUser?.restaurantLng || 107.8381),
      password: existingUser?.password || 'google_oauth_authenticated',
      updatedAt: new Date().toISOString(),
    };

    // 3. Lưu vào Database (nếu có) và luôn đồng bộ vào persistent JSON storage
    let savedUser = null;
    try {
      if (existingUser) {
        savedUser = await (prisma.user as any).update({
          where: { email: normalizedEmail },
          data: {
            name: userData.name,
            role: userData.role,
            status: userData.status,
            avatar: userData.avatar,
            phone: userData.phone,
            restaurantName: userData.restaurantName,
            restaurantAddress: userData.restaurantAddress,
            restaurantPhone: userData.restaurantPhone,
            restaurantLat: userData.restaurantLat,
            restaurantLng: userData.restaurantLng,
          },
        });
      } else {
        savedUser = await (prisma.user as any).create({
          data: userData,
        });
      }
    } catch {
      // DB chưa chạy hoặc chưa migrate -> dùng persistent storage
      savedUser = upsertStoredUser(userData);
    }

    // Luôn lưu bền vững vào JSON
    upsertStoredUser(userData);

    // 4. Nếu là CHỦ QUÁN (OWNER), tự động lưu bản ghi Quán Ăn và ghim lên Bản đồ
    if (userData.role === 'OWNER') {
      const resName = userData.restaurantName || `Quán Ăn ${userData.name}`;
      const slug = `quan-${resName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')}-${userData.id.substring(0, 5)}`;

      // Lưu bản ghi Quán ăn
      const resData = {
        id: `res-${userData.id}`,
        name: resName,
        slug,
        address: userData.restaurantAddress || 'Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
        village: 'Buôn A2, Ea Súp',
        phone: userData.restaurantPhone || userData.phone || '0912 345 678',
        coverImage: restaurantImage || '/mon-ngon/ga-nuong.jpg',
        openTime: '07:30',
        closeTime: '22:00',
        isApproved: userData.status === 'ACTIVE',
        ownerId: userData.id,
      };

      try {
        await (prisma.restaurant as any).upsert({
          where: { id: resData.id },
          create: resData,
          update: resData,
        });
      } catch {
        upsertStoredRestaurant(resData);
      }
      upsertStoredRestaurant(resData);

      // Ghim lên bản đồ danh lam thắng cảnh
      upsertStoredDestination({
        title: resName,
        slug,
        subTitle: 'Quán ăn đặc sản bản địa Ea Súp',
        historicalPeriod: 'Ẩm thực địa phương',
        content: restaurantDesc || `Địa chỉ ẩm thực đặc sản Ea Súp do ${userData.name} phục vụ du khách và người dân địa phương. Quán chuyên các món ăn núi rừng, lẩu cá hồ Ea Súp, gà nướng cơm lam và đặc sản Đắk Lắk.`,
        thumbnail: restaurantImage || '/mon-ngon/ga-nuong.jpg',
        gallery: [restaurantImage || '/mon-ngon/ga-nuong.jpg'],
        address: userData.restaurantAddress || 'Xã Ea Súp, Tỉnh Đắk Lắk',
        latitude: userData.restaurantLat || 13.2456,
        longitude: userData.restaurantLng || 107.8381,
        bestSeason: 'Mở cửa quanh năm',
        entryFee: 'Giá bình dân / Theo thực đơn',
        visitingHours: '06:00 - 22:00',
        culturalNotes: 'Hiếu khách, đậm đà phong vị Tây Nguyên',
        categoryId: 'cat-am-thuc',
        isPublished: true,
        isFeatured: true,
        createdById: userData.id,
      });
    }

    // 5. Ký JWT Token
    const token = signJwtToken({
      userId: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    });

    const response = NextResponse.json({
      success: true,
      message: existingUser ? 'Đăng nhập Google thành công' : 'Đăng ký tài khoản Google thành công',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        avatar: userData.avatar,
        phone: userData.phone,
        restaurantName: userData.restaurantName,
        restaurantAddress: userData.restaurantAddress,
        restaurantPhone: userData.restaurantPhone,
        restaurantLat: userData.restaurantLat,
        restaurantLng: userData.restaurantLng,
      },
      token,
    });

    // Set cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Lỗi API Google Auth:', error);
    return NextResponse.json(
      { success: false, message: 'Đăng nhập bằng Google thất bại: ' + error.message },
      { status: 500 }
    );
  }
}
