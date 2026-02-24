import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgent } from '@/lib/auth';
import { getLeadsByAgent, createLead, findAgentById } from '@/lib/sheets';
import { generateLeadId } from '@/lib/utils';
import { sendLeadConfirmationToClient, sendLeadNotificationToAgent } from '@/lib/email';

export async function GET() {
  try {
    const currentAgent = getCurrentAgent();
    if (!currentAgent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const leads = await getLeadsByAgent(currentAgent.agentId);
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, clientName, clientEmail, clientPhone, packageId, meeting } = await request.json();

    if (!agentId || !clientName || !clientEmail || !clientPhone || !packageId) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const agent = await findAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const leadId = generateLeadId();

    await createLead({
      leadId,
      agentId: agent.agentId,
      agentName: agent.fullName,
      clientName,
      clientEmail,
      clientPhone,
      package: packageId,
      submittedAt: new Date().toISOString(),
    });

    // Send emails (non-blocking)
    sendLeadConfirmationToClient(clientEmail, clientName, agent.fullName, packageId);
    sendLeadNotificationToAgent(agent.email, agent.fullName, clientName, clientEmail, clientPhone, packageId);

    // Create meeting request if provided
    if (meeting?.preferredDate) {
      const { createMeetingRequest } = await import('@/lib/sheets');
      const { generateRequestId } = await import('@/lib/utils');
      await createMeetingRequest({
        requestId: generateRequestId(),
        leadId,
        agentId: agent.agentId,
        clientName,
        clientEmail,
        preferredDate: meeting.preferredDate,
        preferredTime: meeting.preferredTime || '',
        notes: meeting.notes || '',
      });
    }

    return NextResponse.json({ success: true, leadId });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}
