import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAuthUser, requireRole } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    if (user && !requireRole(user, ['EDITOR', 'ADMIN'])) {
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
