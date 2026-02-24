import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgent } from '@/lib/auth';
import { getLeadsByAgent, createLead, findAgentById, createMeetingRequest } from '@/lib/sheets';
import { sendLeadConfirmationToClient, sendLeadNotificationToAgent } from '@/lib/email';

export async function GET() {
  try {
    const currentAgent = getCurrentAgent();
    if (!currentAgent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const leads = await getLeadsByAgent(currentAgent.email);
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentId,
      firstName,
      lastName,
      clientEmail,
      clientPhone,
      packageId,
      companyName,
      teamSize,
      preferredContact,
      bestTime,
      notes,
      meeting,
    } = body;

    if (!agentId || !firstName || !lastName || !clientEmail || !clientPhone || !packageId) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 });
    }

    const agent = await findAgentById(agentId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const clientName = `${firstName} ${lastName}`;

    await createLead({
      agentName: agent.fullName,
      agentEmail: agent.email,
      firstName,
      lastName,
      clientEmail,
      clientPhone,
      packageId,
      companyName: companyName || '',
      teamSize: teamSize || '',
      preferredContact: preferredContact || '',
      bestTime: bestTime || '',
      notes: notes || '',
      leadSource: 'QR Code',
    });

    // Send emails (non-blocking)
    sendLeadConfirmationToClient(agent.email, clientEmail, clientName, agent.fullName, packageId);
    sendLeadNotificationToAgent(agent.email, agent.fullName, clientName, clientEmail, clientPhone, packageId);

    // Create meeting request if provided
    if (meeting?.preferredDate) {
      await createMeetingRequest({
        agentName: agent.fullName,
        agentEmail: agent.email,
        clientName,
        clientEmail,
        clientPhone,
        packageInterest: packageId,
        preferredDate: meeting.preferredDate,
        preferredTime: meeting.preferredTime || '',
        meetingType: meeting.meetingType || 'Virtual',
        notes: meeting.notes || '',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}
