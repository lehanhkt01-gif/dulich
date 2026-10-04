import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Đã đăng xuất tài khoản thành công',
  });

  // Xóa cookie auth_token (JWT cookie httpOnly)
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  // Đồng thời dọn dẹp các cookie phiên NextAuth / Auth.js nếu có
  const authCookies = [
    'authjs.session-token',
    '__Secure-authjs.session-token',
    'authjs.csrf-token',
    'next-auth.session-token',
    '__Secure-next-auth.session-token',
    'next-auth.csrf-token',
  ];

  for (const cookieName of authCookies) {
    response.cookies.set(cookieName, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

export async function GET(req: NextRequest) {
  return POST(req);
}
