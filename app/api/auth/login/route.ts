import { NextRequest, NextResponse } from 'next/server';
import { findAgentByEmail } from '@/lib/sheets';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const agent = await findAgentByEmail(email);
    if (!agent) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await verifyPassword(password, agent.hashedPassword);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createToken({
      agentId: agent.agentId,
      email: agent.email,
      fullName: agent.fullName,
    });
    setAuthCookie(token);

    return NextResponse.json({
      success: true,
      agent: {
        agentId: agent.agentId,
        fullName: agent.fullName,
        email: agent.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to log in' }, { status: 500 });
  }
}
