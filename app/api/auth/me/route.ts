import { NextResponse } from 'next/server';
import { getCurrentAgent } from '@/lib/auth';

export async function GET() {
  const agent = getCurrentAgent();
  if (!agent) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  return NextResponse.json({ agent });
}
