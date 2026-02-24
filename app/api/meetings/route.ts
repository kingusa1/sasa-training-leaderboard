import { NextRequest, NextResponse } from 'next/server';
import { findAgentById, createMeetingRequest } from '@/lib/sheets';
import { sendMeetingConfirmationToClient } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      clientName,
      clientEmail,
      clientPhone,
      packageId,
      preferredDate,
      preferredTime,
      notes,
    } = body;

    if (!agentId || !clientName || !clientEmail || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Required fields: agentId, clientName, clientEmail, preferredDate, preferredTime' },
        { status: 400 }
      );
    }

    const agent = await findAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await createMeetingRequest({
      agentName: agent.fullName,
      agentEmail: agent.email,
      clientName,
      clientEmail,
      clientPhone: clientPhone || '',
      packageInterest: packageId || '',
      preferredDate,
      preferredTime,
      meetingType: 'Virtual',
      notes: notes || '',
    });

    // Send meeting confirmation email (non-blocking)
    sendMeetingConfirmationToClient(
      agent.email,
      clientEmail,
      clientName,
      agent.fullName,
      packageId || '',
      preferredDate,
      preferredTime
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create meeting error:', error);
    return NextResponse.json({ error: 'Failed to schedule meeting' }, { status: 500 });
  }
}
