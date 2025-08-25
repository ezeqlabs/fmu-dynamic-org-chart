import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    if (!SECRET_KEY) {
      throw new Error('A chave secreta JWT não está configurada');
    }
    const secret = new TextEncoder().encode(SECRET_KEY);
    await jwtVerify(token, secret);
    
    return NextResponse.next();
  } catch (err) {
    console.error('Falha na autenticação do token:', err);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: '/admin/dashboard/:path*',
};