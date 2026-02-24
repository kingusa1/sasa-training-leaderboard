import { NextRequest, NextResponse } from 'next/server';
import { findAgentByEmail, createAgent } from '@/lib/sheets';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { generateAgentId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, phone, password } = await request.json();

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Check if agent already exists
    const existing = await findAgentByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    // Create agent
    const agentId = generateAgentId();
    const hashedPassword = await hashPassword(password);

    await createAgent({
      agentId,
      fullName,
      email: email.toLowerCase(),
      phone,
      hashedPassword,
    });

    // Create token and set cookie
    const token = createToken({ agentId, email: email.toLowerCase(), fullName });
    setAuthCookie(token);

    return NextResponse.json({
      success: true,
      agent: { agentId, fullName, email: email.toLowerCase() },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
