import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

import redis from '@/lib/redis';

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token || !SECRET_KEY) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }
  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    await jwtVerify(token, secret);
  } catch (err) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  // 2. Processar o formulário
  const formData = await request.formData();
  const organogramFile = formData.get('organogramData') as File;
  const gradesFile = formData.get('gradesData') as File;

  if (!organogramFile || !gradesFile) {
    return NextResponse.json({ message: 'Arquivos ausentes' }, { status: 400 });
  }

  const MAX_FILE_SIZE_MB = 4.5;
  if (organogramFile.size > MAX_FILE_SIZE_MB * 1024 * 1024 || gradesFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return NextResponse.json({ message: `Um dos arquivos excede o limite de ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 });
  }

  try {
    const [orgBlob, gradesBlob] = await Promise.all([
      put(`organograma-dados.xlsx`, organogramFile, {
        access: 'public', 
        addRandomSuffix: false, 
        allowOverwrite: true
      }),
      put(`grades-info.xlsx`, gradesFile, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true
      })
    ]);

    await Promise.all([
      redis.set('org_data_url', orgBlob.url),
      redis.set('grades_data_url', gradesBlob.url)
    ]);
    
    return NextResponse.json({ success: true, orgUrl: orgBlob.url, gradesUrl: gradesBlob.url });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ message: 'Erro ao processar o upload' }, { status: 500 });
  }
}