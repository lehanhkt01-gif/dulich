import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Context {
  params: Promise<{ file: string[] }>;
}

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { file } = await params;
    if (!file || file.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const filename = file.join('/');
    // Tránh path traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');

    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.webp': 'image/webp',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.gif': 'image/gif',
      '.ico': 'image/x-icon',
      '.mp3': 'audio/mpeg',
      '.ogg': 'audio/ogg',
      '.wav': 'audio/wav',
      '.m4a': 'audio/mp4',
      '.mp4': 'video/mp4',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload file:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
