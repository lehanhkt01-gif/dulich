import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const isImage = file.type.startsWith('image/');

    let finalFilename = '';

    if (isImage) {
      // Nén ảnh sang định dạng WebP chất lượng 82% và kích thước tối đa 1920px
      finalFilename = `${originalName}-${timestamp}.webp`;
      const filePath = path.join(uploadDir, finalFilename);

      await sharp(buffer)
        .resize({ width: 1920, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(filePath);
    } else {
      // Tệp âm thanh hoặc tệp khác giữ nguyên định dạng an toàn
      const ext = path.extname(file.name) || '.mp3';
      finalFilename = `${originalName}-${timestamp}${ext}`;
      const filePath = path.join(uploadDir, finalFilename);
      fs.writeFileSync(filePath, buffer);
    }

    const fileUrl = `/uploads/${finalFilename}`;

    return NextResponse.json({
      success: true,
      message: 'Tải tệp và tối ưu hóa thành công',
      url: fileUrl,
      fileName: finalFilename,
      type: isImage ? 'image/webp' : file.type,
    });
  } catch (error) {
    console.error('Error in upload API:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xử lý tệp tải lên' },
      { status: 500 }
    );
  }
}
