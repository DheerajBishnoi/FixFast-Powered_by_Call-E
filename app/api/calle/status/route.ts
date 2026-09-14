import { NextResponse } from 'next/server';
import { checkCalleCliAvailable } from '@/lib/calle-adapter';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await checkCalleCliAvailable();
  return NextResponse.json(status);
}
