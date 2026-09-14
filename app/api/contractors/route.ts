import { NextResponse } from 'next/server';
import { CONTRACTOR_ROSTER } from '@/lib/roster';
import { SCENARIO_PRESETS } from '@/lib/scenarios';

export async function GET() {
  return NextResponse.json({
    contractors: CONTRACTOR_ROSTER,
    presets: SCENARIO_PRESETS
  });
}
