import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Usaremos JWT para criar um token de sessão
import { cookies } from 'next/headers';

// Uma "chave secreta" para assinar nosso token. Deve ser a mesma usada para verificar.
// Em um projeto real, isso também viria de uma variável de ambiente.
const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: Request) {
  if (!SECRET_KEY) {
    throw new Error('A chave secreta JWT não está configurada no .env.local');
  }

  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 1. Verifica se a senha enviada é a mesma da nossa variável de ambiente
    if (password === adminPassword) {
      // 2. Se a senha estiver correta, criamos um "token"
      // Este token é uma prova de que o usuário está autenticado
      const token = jwt.sign({ user: 'admin' }, SECRET_KEY, { expiresIn: '8h' });

      // 3. Armazenamos o token em um cookie seguro
      // httpOnly: O cookie não pode ser acessado por JavaScript no navegador (mais seguro)
      // path: '/': O cookie é válido para todas as páginas do site
      cookies().set('auth_token', token, { httpOnly: true, path: '/' });

      return NextResponse.json({ success: true, message: 'Login bem-sucedido!' });
    } else {
      // Se a senha estiver errada, retorna um erro 401 (Não Autorizado)
      return NextResponse.json({ success: false, message: 'Senha inválida' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Erro interno do servidor' }, { status: 500 });
  }
}