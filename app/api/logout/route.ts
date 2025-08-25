import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Remove o cookie de autenticação
    cookies().delete('auth_token');
    return NextResponse.json({ success: true, message: 'Logout bem-sucedido' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro ao fazer logout' }, { status: 500 });
  }
}