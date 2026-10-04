import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { Role } from './types';

const AUTH_SECRET = process.env.AUTH_SECRET || 'danh-thang-ky-secure-heritage-jwt-secret-key-32chars';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}

export function signJwtToken(payload: TokenPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('authorization');
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Hoặc lấy từ cookie
    const cookieToken = req.cookies.get('auth_token')?.value;
    if (cookieToken) token = cookieToken;
  }

  if (!token) return null;
  return verifyJwtToken(token);
}

export function requireRole(user: TokenPayload | null, allowedRoles: Role[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

export function isAdmin(user: TokenPayload | null): boolean {
  return !!user && user.role === 'ADMIN';
}

export function isOwner(user: TokenPayload | null): boolean {
  return !!user && (user.role === 'OWNER' || user.role === 'ADMIN');
}

export function canManageEntity(user: TokenPayload | null, entityOwnerId?: string | null): boolean {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.role === 'OWNER' && entityOwnerId && (entityOwnerId === user.userId || entityOwnerId === user.email)) {
    return true;
  }
  return false;
}

