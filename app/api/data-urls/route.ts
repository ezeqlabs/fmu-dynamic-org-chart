import { NextResponse } from 'next/server';
import redis from '@/lib/redis';

export const revalidate = 0;

export async function GET() {
  try {
    const [orgDataUrl, gradesDataUrl] = await redis.mget([
      'org_data_url',
      'grades_data_url'
    ]);

    return NextResponse.json({ orgDataUrl, gradesDataUrl });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar URLs dos dados' }, { status: 500 });
  }
}