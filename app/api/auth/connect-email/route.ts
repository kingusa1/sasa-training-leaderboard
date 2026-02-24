import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAgent } from '@/lib/auth';
import { updateAgentEmailCredentials, findAgentByEmail } from '@/lib/sheets';
import { testEmailConnection } from '@/lib/email';

export async function GET() {
  try {
    const currentAgent = getCurrentAgent();
    if (!currentAgent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const agent = await findAgentByEmail(currentAgent.email);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailConnected: agent.emailConnected || false,
      email: agent.email,
    });
  } catch (error) {
    console.error('Check email status error:', error);
    return NextResponse.json({ error: 'Failed to check email status' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentAgent = getCurrentAgent();
    if (!currentAgent) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { emailPassword } = await request.json();
    if (!emailPassword) {
      return NextResponse.json({ error: 'Email password is required' }, { status: 400 });
    }

    // Test the SMTP connection first
    const isValid = await testEmailConnection(currentAgent.email, emailPassword);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Could not connect to email server. Please check your email password.' },
        { status: 400 }
      );
    }

    // Save credentials to Google Sheet
    await updateAgentEmailCredentials(currentAgent.email, emailPassword);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Connect email error:', error);
    return NextResponse.json({ error: 'Failed to connect email' }, { status: 500 });
  }
}
