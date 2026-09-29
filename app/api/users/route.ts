import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { INITIAL_USERS } from '@/lib/data/seed-data';
import { User } from '@/lib/types';

// In-memory fallback
let memoryUsers: User[] = [...INITIAL_USERS];

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
      return NextResponse.json({ success: true, data: memoryUsers });
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

    try {
      // Check existing email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json(
          { success: false, message: 'Email này đã tồn tại trong hệ thống' },
          { status: 400 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: assignedRole,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
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

      return NextResponse.json({
        success: true,
        message: 'Cấp quyền tài khoản mới thành công!',
        data: newUser,
      });
    } catch {
      // Fallback
      if (memoryUsers.some((u) => u.email === email)) {
        return NextResponse.json(
          { success: false, message: 'Email này đã tồn tại trong hệ thống' },
          { status: 400 }
        );
      }

      const mockUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: assignedRole,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
      };
      memoryUsers.push(mockUser);

      return NextResponse.json({
        success: true,
        message: 'Cấp quyền tài khoản mới thành công (chế độ dự phòng)!',
        data: mockUser,
      });
    }
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
      // Đếm số lượng ADMIN còn lại
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const targetUser = await prisma.user.findUnique({ where: { id } });

      if (targetUser?.role === 'ADMIN' && adminCount <= 1) {
        return NextResponse.json(
          { success: false, message: 'Không thể xóa tài khoản Quản trị viên (ADMIN) cuối cùng' },
          { status: 400 }
        );
      }

      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Đã xóa tài khoản thành công' });
    } catch {
      memoryUsers = memoryUsers.filter((u) => u.id !== id);
      return NextResponse.json({ success: true, message: 'Đã xóa tài khoản thành công' });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa tài khoản: ' + error.message },
      { status: 500 }
    );
  }
}
