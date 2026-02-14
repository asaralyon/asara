import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token =
      request.cookies.get('auth-token')?.value ||
      request.cookies.get('token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub && !(payload as any).id) return null;

    const userId = (payload.sub || (payload as any).id) as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      role: user.role,
    };
  } catch {
    return null;
  }
}
