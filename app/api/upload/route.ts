import { put, BlobError } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import * as XLSX from 'xlsx';

import redis from '@/lib/redis';
import { validateOrganogramData } from '@/utils/validators';
import { columnMapping } from '@/config/mappings';
import type { Employee } from '@/types';

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
    return NextResponse.json({ message: 'Token inválido ou expirado' }, { status: 401 });
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
    return NextResponse.json({ message: `O arquivo do organograma excede o limite de ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 });
  }
  if (gradesFile && gradesFile.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json({ message: `O arquivo de grades excede o limite de ${MAX_FILE_SIZE_MB} MB.` }, { status: 413 });
  }

  try {
    if (organogramFile) {
      const buffer = await organogramFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Employee[];
      
      const validation = validateOrganogramData(jsonData, columnMapping);
      
      if (!validation.isValid) {
        return NextResponse.json({ message: 'A planilha de organograma contém erros.', errors: validation.errors }, { status: 400 });
      }
    }

    const uploadTasks = [];

    if (organogramFile) {
      const orgBlobPromise = put('organograma-dados.xlsx', organogramFile, { 
        access: 'public', 
        addRandomSuffix: false,
        allowOverwrite: true,
      }).then(blob => redis.set('org_data_url', blob.url));
      uploadTasks.push(orgBlobPromise);
    }

    if (gradesFile) {
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