import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthUser, requireRole } from '@/lib/auth';
import { getCurrentUser } from '@/actions/guards';

export async function POST(req: NextRequest) {
  try {
    // Kiểm tra quyền từ JWT token hoặc NextAuth session
    const jwtUser = getAuthUser(req);
    const sessionUser = await getCurrentUser();
    const effectiveRole = jwtUser?.role || sessionUser?.role;

    if (effectiveRole && !['OWNER', 'EDITOR', 'ADMIN'].includes(effectiveRole)) {
      return NextResponse.json(
        { success: false, message: 'Quyền truy cập bị từ chối' },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tệp tải lên' },
        { status: 400 }
      );
    }

    // Giới hạn kích thước tệp dưới 3MB
    const MAX_SIZE = 3 * 1024 * 1024; // 3MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Kích thước tệp vượt quá giới hạn 3MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 50);

    const ext = path.extname(file.name) || (file.type.startsWith('image/') ? '.jpg' : '.mp3');
    const finalFilename = `${originalName}-${timestamp}${ext}`;
    const filePath = path.join(uploadDir, finalFilename);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${finalFilename}`;

    return NextResponse.json({
      success: true,
      message: 'Tải tệp và lưu trữ thành công',
      url: fileUrl,
      fileName: finalFilename,
      type: file.type,
    });
  } catch (error: any) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xử lý tệp tải lên: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
