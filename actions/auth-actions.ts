'use server';

import { prisma } from '@/lib/prisma';
import {
  getStoredUsers,
  upsertStoredUser,
  getStoredRestaurants,
  upsertStoredRestaurant,
  addStoredNotification,
} from '@/lib/storage';
import { signJwtToken } from '@/lib/auth';
import { cookies } from 'next/headers';

import bcrypt from 'bcryptjs';
import { sendNewOwnerRegisteredEmail } from '@/lib/email';

export interface RegisterOwnerInput {
  name: string;
  phone: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  restaurantName: string;
  restaurantAddress: string;
  village?: string;
  openTime?: string;
  closeTime?: string;
  coverImage?: string;
}

/**
 * Đăng ký tài khoản Chủ Quán Ăn mới (Role OWNER, Status PENDING)
 */
export async function registerOwnerAction(input: RegisterOwnerInput) {
  try {
    if (!input.name || !input.phone || !input.email || !input.restaurantName) {
      return { success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc.' };
    }

    if (input.password) {
      if (input.password.length < 6) {
        return { success: false, message: 'Mật khẩu phải có tối thiểu 6 ký tự.' };
      }
      if (input.confirmPassword && input.password !== input.confirmPassword) {
        return { success: false, message: 'Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.' };
      }
    }

    const emailNorm = input.email.trim().toLowerCase();

    // 1. Kiểm tra tài khoản đã tồn tại hay chưa
    let existingUser: any = null;
    try {
      existingUser = await prisma.user.findUnique({ where: { email: emailNorm } });
    } catch {
      const storedUsers = getStoredUsers();
      existingUser = storedUsers.find((u) => u.email?.toLowerCase() === emailNorm);
    }

    // Quy định: Nếu email đã đăng ký làm chủ quán
    if (existingUser && existingUser.role === 'OWNER') {
      return {
        success: false,
        message: 'Email này đã đăng ký làm chủ quán từ trước. Vui lòng đăng nhập tại tab Chủ Quán.',
      };
    }

    let userId = existingUser?.id;
    const hashedPassword = input.password ? await bcrypt.hash(input.password, 10) : 'oauth_or_pending';

    if (!existingUser) {
      // Tạo User mới với role OWNER, status PENDING
      const newUser = {
        name: input.name,
        email: emailNorm,
        phone: input.phone,
        role: 'OWNER' as const,
        status: 'PENDING' as const,
        restaurantName: input.restaurantName,
        restaurantAddress: input.restaurantAddress,
        restaurantPhone: input.phone,
        password: hashedPassword,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(input.name)}`,
      };

      try {
        const created = await prisma.user.create({
          data: newUser,
        });
        userId = created.id;
      } catch {
        const created = upsertStoredUser(newUser);
        userId = created.id;
      }
    } else {
      // QUY ĐỊNH: Nếu đã có tài khoản khách hàng (TRAVELER / USER), cho phép nâng cấp lên OWNER và XÓA vai trò khách hàng
      const updateData: any = {
        role: 'OWNER',
        status: 'PENDING',
        phone: input.phone,
        restaurantName: input.restaurantName,
        restaurantAddress: input.restaurantAddress,
      };
      if (input.password) {
        updateData.password = hashedPassword;
      }

      try {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: updateData,
        });
      } catch {
        upsertStoredUser({
          ...existingUser,
          ...updateData,
        });
      }
    }

    // 2. Tạo thông tin Quán Ăn (isApproved: false)
    const slug = input.restaurantName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const restaurantData = {
      name: input.restaurantName,
      slug: `${slug}-${Math.random().toString(36).substring(2, 6)}`,
      address: input.restaurantAddress || 'Xã Ea Súp, Huyện Ea Súp, Tỉnh Đắk Lắk',
      village: input.village || 'Buôn A2',
      phone: input.phone,
      coverImage: input.coverImage || '/mon-ngon/ga-nuong.jpg',
      openTime: input.openTime || '08:00',
      closeTime: input.closeTime || '22:00',
      isApproved: false,
      ownerId: userId,
    };

    try {
      await prisma.restaurant.create({ data: restaurantData });
    } catch {
      upsertStoredRestaurant(restaurantData);
    }

    // 3. Tạo thông báo cho Ban Quản Trị
    const adminNotif = {
      userId: 'user-admin-default',
      title: 'Hồ sơ Chủ Quán mới đăng ký',
      message: `Chủ quán ${input.name} vừa đăng ký mở quán "${input.restaurantName}" tại ${input.village || 'Ea Súp'}. Vui lòng phê duyệt.`,
      link: '/admin/mon-ngon',
    };
    try {
      await prisma.notification.create({ data: adminNotif });
    } catch {
      addStoredNotification(adminNotif);
    }

    // 4. Gửi email thông báo hồ sơ mới cho Admin (Lehanhkt01@gmail.com)
    sendNewOwnerRegisteredEmail({
      ownerName: input.name,
      ownerEmail: emailNorm,
      ownerPhone: input.phone,
      restaurantName: input.restaurantName,
      restaurantAddress: input.restaurantAddress,
    }).catch(console.error);

    return {
      success: true,
      pending: true,
      message: 'Hồ sơ quán của bạn đang được Ban Quản trị xét duyệt. Bạn sẽ nhận được thông báo khi được kích hoạt.',
    };
  } catch (error: any) {
    console.error('Lỗi khi đăng ký chủ quán:', error);
    return { success: false, message: error.message || 'Lỗi xử lý đăng ký' };
  }
}

/**
 * Đăng nhập Chủ quán (kiểm tra trạng thái duyệt)
 */
export async function loginOwnerAction(email: string) {
  try {
    const emailNorm = email.trim().toLowerCase();
    let user: any = null;

    try {
      user = await prisma.user.findUnique({ where: { email: emailNorm } });
    } catch {
      const storedUsers = getStoredUsers();
      user = storedUsers.find((u) => u.email?.toLowerCase() === emailNorm);
    }

    if (!user) {
      return { success: false, message: 'Email này chưa được đăng ký trong hệ thống.' };
    }

    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Tài khoản này chưa đăng ký quyền Chủ Quán Ăn. Vui lòng đăng ký trước.',
      };
    }

    if (user.status === 'BLOCKED') {
      return { success: false, message: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên.' };
    }

    if (user.status === 'PENDING') {
      return {
        success: false,
        pending: true,
        message: 'Tài khoản đang chờ Admin phê duyệt',
      };
    }

    // Thiết lập phiên đăng nhập JWT cookie
    const token = signJwtToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurantName: user.restaurantName,
      },
    };
  } catch (error: any) {
    console.error('Lỗi đăng nhập chủ quán:', error);
    return { success: false, message: error.message || 'Lỗi đăng nhập' };
  }
}
