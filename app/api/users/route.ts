import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getStoredUsers, upsertStoredUser, deleteStoredUser, getStoredUserById } from '@/lib/storage';
import { getAuthUser, isAdmin } from '@/lib/auth';
import { sendNewOwnerRegisteredEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    try {
      const users = await (prisma.user as any).findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          avatar: true,
          phone: true,
          restaurantName: true,
          restaurantAddress: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json({ success: true, data: users });
    } catch {
      const users = getStoredUsers().map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || 'TRAVELER',
        status: u.status || 'ACTIVE',
        avatar: u.avatar,
        phone: u.phone,
        restaurantName: u.restaurantName,
        restaurantAddress: u.restaurantAddress,
        createdAt: u.createdAt,
      }));
      return NextResponse.json({ success: true, data: users });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi tải danh sách người dùng: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, restaurantName, restaurantAddress, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Hỗ trợ cả 4 vai trò: ADMIN, OWNER, EDITOR, TRAVELER
    const validRoles = ['ADMIN', 'OWNER', 'EDITOR', 'TRAVELER'];
    const assignedRole = validRoles.includes(role) ? role : 'TRAVELER';
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    let savedUser: any = null;

    try {
      // Check existing email in DB
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Email này đã tồn tại trong hệ thống' },
          { status: 400 }
        );
      }

      savedUser = await (prisma.user as any).create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: assignedRole,
          avatar: avatarUrl,
          phone: phone || null,
          restaurantName: restaurantName || null,
          restaurantAddress: restaurantAddress || null,
        },
      });

      // Đồng bộ vào persistent JSON storage
      upsertStoredUser({
        ...savedUser,
        password: hashedPassword,
      });
    } catch {
      // Fallback persistent storage
      const existingUsers = getStoredUsers();
      if (existingUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return NextResponse.json(
          { success: false, message: 'Email này đã tồn tại trong hệ thống' },
          { status: 400 }
        );
      }

      savedUser = upsertStoredUser({
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        avatar: avatarUrl,
        phone: phone || null,
        restaurantName: restaurantName || null,
        restaurantAddress: restaurantAddress || null,
      });
    }

    // Nếu là đăng ký vai trò OWNER, tự động gửi Email thông báo cho ADMIN (Lehanhkt01@gmail.com)
    if (assignedRole === 'OWNER') {
      sendNewOwnerRegisteredEmail({
        ownerName: name,
        ownerEmail: email,
        ownerPhone: phone,
        restaurantName: restaurantName || 'Quán ăn mới',
        restaurantAddress,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Cấp quyền tài khoản mới thành công!',
      data: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar,
        restaurantName: savedUser.restaurantName,
        createdAt: savedUser.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tạo tài khoản: ' + error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users
 * Toàn quyền phân quyền, chỉnh sửa vai trò và thông tin người dùng dành cho Admin
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    // Kiểm tra quyền Admin
    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (ADMIN) mới có quyền thay đổi vai trò và phân quyền tài khoản' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, role, restaurantName, restaurantAddress, phone, name } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID người dùng cần chỉnh sửa' },
        { status: 400 }
      );
    }

    const validRoles = ['ADMIN', 'OWNER', 'EDITOR', 'TRAVELER'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Vai trò phân quyền không hợp lệ' },
        { status: 400 }
      );
    }

    const updatePayload: any = { id };
    if (role) updatePayload.role = role;
    if (name) updatePayload.name = name;
    if (restaurantName !== undefined) updatePayload.restaurantName = restaurantName;
    if (restaurantAddress !== undefined) updatePayload.restaurantAddress = restaurantAddress;
    if (phone !== undefined) updatePayload.phone = phone;

    try {
      await (prisma.user as any).update({
        where: { id },
        data: updatePayload,
      });
    } catch {
      // Bỏ qua nếu DB chưa migrate
    }

    const updatedUser = upsertStoredUser(updatePayload);

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật phân quyền thành công cho tài khoản ${updatedUser.name}`,
      data: updatedUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật phân quyền: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = getAuthUser(req);
    // Yêu cầu quyền Admin để xóa tài khoản
    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { success: false, message: 'Chỉ Quản trị viên (ADMIN) mới có quyền xóa tài khoản người dùng' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID tài khoản cần xóa' },
        { status: 400 }
      );
    }

    // Không cho phép xóa superadmin mặc định
    const targetUser = getStoredUserById(id);
    if (targetUser?.email === 'admin@easup.daklak.gov.vn') {
      return NextResponse.json(
        { success: false, message: 'Không thể xóa tài khoản Quản trị viên hệ thống mặc định' },
        { status: 400 }
      );
    }

    try {
      // Đếm số lượng ADMIN còn lại trong DB
      const adminCount = await (prisma.user as any).count({ where: { role: 'ADMIN' } });
      const dbUser = await (prisma.user as any).findUnique({ where: { id } });

      if (dbUser?.role === 'ADMIN' && adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Không thể xóa tài khoản Quản trị viên (ADMIN) cuối cùng' },
          { status: 400 }
        );
      }

      await (prisma.user as any).delete({ where: { id } });
    } catch {
      // Bỏ qua lỗi DB nếu chưa kết nối
    }

    // Xóa trong persistent storage
    deleteStoredUser(id);

    return NextResponse.json({ success: true, message: 'Đã xóa tài khoản thành công' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa tài khoản: ' + error.message },
      { status: 500 }
    );
  }
}
