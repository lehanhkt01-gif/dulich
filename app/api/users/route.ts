import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getStoredUsers, upsertStoredUser, deleteStoredUser } from '@/lib/storage';

export async function GET() {
  try {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
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
        role: u.role,
        avatar: u.avatar,
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
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ Tên, Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'EDITOR';
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

      savedUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: assignedRole,
          avatar: avatarUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
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
      if (existingUsers.some((u) => u.email === email)) {
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
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cấp quyền tài khoản mới thành công và đã lưu bền vững!',
      data: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        avatar: savedUser.avatar,
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Thiếu ID tài khoản cần xóa' },
        { status: 400 }
      );
    }

    try {
      // Đếm số lượng ADMIN còn lại trong DB
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const targetUser = await prisma.user.findUnique({ where: { id } });

      if (targetUser?.role === 'ADMIN' && adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Không thể xóa tài khoản Quản trị viên (ADMIN) cuối cùng' },
          { status: 400 }
        );
      }

      await prisma.user.delete({ where: { id } });
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
