import { NextRequest, NextResponse } from 'next/server';
import { findAgentById } from '@/lib/sheets';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await findAgentById(params.id);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Only return public info
    return NextResponse.json({
      agent: {
        agentId: agent.agentId,
        fullName: agent.fullName,
      },
    });
  } catch (error) {
    console.error('Get agent error:', error);
    return NextResponse.json({ error: 'Failed to load agent' }, { status: 500 });
  }
}
