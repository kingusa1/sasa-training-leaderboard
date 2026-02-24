import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgent } from '@/lib/auth';
import { toggleLeadField } from '@/lib/sheets';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { row: string } }
) {
  try {
    const currentAgent = getCurrentAgent();
    if (!currentAgent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const rowIndex = parseInt(params.row, 10);
    if (isNaN(rowIndex) || rowIndex < 2) {
      return NextResponse.json({ error: 'Invalid row index' }, { status: 400 });
    }

    const { field, value } = await request.json();
    if (!field || !['meetingDone', 'paymentReceived'].includes(field)) {
      return NextResponse.json({ error: 'Invalid field' }, { status: 400 });
    }

    await toggleLeadField(rowIndex, field as 'meetingDone' | 'paymentReceived', Boolean(value));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle lead error:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
