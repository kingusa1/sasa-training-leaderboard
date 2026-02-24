import { NextResponse } from 'next/server';
import { getLeaderboardData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getLeaderboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard data' }, { status: 500 });
  }
}
