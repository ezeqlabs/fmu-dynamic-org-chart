import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: Request) {
  if (!SECRET_KEY) {
    throw new Error('A chave secreta JWT não está configurada no .env.local');
  }

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (password === adminPassword) {
      const token = jwt.sign({ user: 'admin' }, SECRET_KEY, { expiresIn: '8h' });
      const response = NextResponse.json({ success: true, message: 'Login bem-sucedido!' });

      response.cookies.set('auth_token', token, { httpOnly: true, path: '/' });

      return response;
    } else {
      return NextResponse.json({ success: false, message: 'Senha inválida' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}