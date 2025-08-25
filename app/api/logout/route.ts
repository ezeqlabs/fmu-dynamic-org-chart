import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logout bem-sucedido' });
    response.cookies.delete('auth_token');
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao fazer logout' }, { status: 500 });
  }
}