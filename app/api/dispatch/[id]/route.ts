import { NextRequest, NextResponse } from 'next/server';
import { getCascadeSession, stepCascadeSession } from '@/lib/engine';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getCascadeSession(params.id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  return NextResponse.json(session);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updated = await stepCascadeSession(params.id);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
