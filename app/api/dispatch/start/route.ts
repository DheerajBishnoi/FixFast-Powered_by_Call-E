import { NextRequest, NextResponse } from 'next/server';
import { createCascadeSession } from '@/lib/engine';
import { Incident } from '@/lib/types';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, trade, address, description, maxEtaMinutes, maxBudget, severity, mode } = body;

    if (!trade || !address || !description) {
      return NextResponse.json({ error: 'Missing required incident fields' }, { status: 400 });
    }

    const incident: Incident = {
      id: `inc_${Date.now()}`,
      title: title || `${trade.toUpperCase()} Emergency at ${address}`,
      trade,
      address,
      description,
      maxEtaMinutes: Number(maxEtaMinutes) || 90,
      maxBudget: Number(maxBudget) || 350,
      severity: severity || 'critical',
      createdAt: new Date().toISOString()
    };

    const session = createCascadeSession(incident, mode || 'simulator');
    return NextResponse.json(session);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
