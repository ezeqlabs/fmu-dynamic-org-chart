import { put, BlobError } from '@vercel/blob';
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

  const formData = await request.formData();
  const organogramFile = formData.get('organogramData') as File | null;
  const gradesFile = formData.get('gradesData') as File | null;

  if (!organogramFile && !gradesFile) {
    return NextResponse.json({ message: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  const MAX_FILE_SIZE_MB = 4.5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

  if (organogramFile && organogramFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: `O arquivo do organograma excede o limite de ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 }); // 413 = Payload Too Large
  }

  if (gradesFile && gradesFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: `O arquivo de grades excede o limite de ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 });
  }

  try {
    const uploadTasks = [];

    if (organogramFile) {
      console.log("Processando arquivo do organograma...");
      const orgBlobPromise = put('organograma-dados.xlsx', organogramFile, { 
        access: 'public', 
        addRandomSuffix: false,
        allowOverwrite: true,
      }).then(blob => redis.set('org_data_url', blob.url));
      uploadTasks.push(orgBlobPromise);
    }

    if (gradesFile) {
      console.log("Processando arquivo de grades...");
      const gradesBlobPromise = put('grades-info.xlsx', gradesFile, { 
        access: 'public', 
        addRandomSuffix: false,
        allowOverwrite: true,
      }).then(blob => redis.set('grades_data_url', blob.url));
      uploadTasks.push(gradesBlobPromise);
    }
    
    await Promise.all(uploadTasks);
    
    return NextResponse.json({ success: true, message: 'Arquivos processados com sucesso.' });

  } catch (error) {
    console.error('Erro no upload:', error);
    if (error instanceof BlobError) {
        return NextResponse.json({ message: `Erro no serviço de armazenamento: ${error.message}` }, { status: 500 });
    }
    return NextResponse.json({ message: 'Erro interno ao processar o upload.' }, { status: 500 });
  }
}