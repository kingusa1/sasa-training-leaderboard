import nodemailer from 'nodemailer';
import { PACKAGES, SMTP_CONFIG, COMPANY } from './constants';
import { findAgentByEmail } from './sheets';

async function getTransporter(agentEmail: string) {
  const agent = await findAgentByEmail(agentEmail);
  if (!agent || !agent.emailPassword || !agent.emailConnected) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: {
      user: agent.email,
      pass: agent.emailPassword,
    },
  });
}

export async function sendLeadConfirmationToClient(
  agentEmail: string,
  clientEmail: string,
  clientName: string,
  agentName: string,
  packageId: string
): Promise<void> {
  const pkg = PACKAGES.find((p) => p.id === packageId || p.name === packageId);
  const packageName = pkg?.fullName || pkg?.name || packageId;
  const packagePrice = pkg && pkg.price > 0 ? `AED ${pkg.price.toLocaleString()}` : '';
  const enrollUrl = pkg?.enrollUrl;

  const transporter = await getTransporter(agentEmail);
  if (!transporter) {
    console.log('Email not configured for agent:', agentEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"${agentName} - SASA Worldwide" <${agentEmail}>`,
      to: clientEmail,
      subject: `Thank you for your interest in ${pkg?.name || packageId} - SASA Training`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A1628, #0D4785); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A227; margin: 0; font-size: 24px;">SASA Worldwide</h1>
            <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">Sales Training &amp; Certification</p>
          </div>

          <h2 style="color: #0D4785;">Hello ${clientName}!</h2>
          <p style="color: #333; line-height: 1.6;">
            Thank you for your interest in the <strong>${packageName}</strong>${packagePrice ? ` (${packagePrice})` : ''}.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Your dedicated training consultant <strong>${agentName}</strong> will be in touch with you shortly to discuss the next steps.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0D4785; margin-top: 0;">What happens next?</h3>
            <ol style="color: #555; line-height: 1.8;">
              <li>Your consultant will reach out to schedule a meeting</li>
              <li>You'll discuss the course details and any questions</li>
              <li>Upon enrollment, you'll receive full access</li>
            </ol>
          </div>

          ${enrollUrl ? `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${enrollUrl}" style="display: inline-block; background: linear-gradient(135deg, #A88620, #C9A227); color: #0A1628; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Enroll Now
            </a>
          </div>
          ` : `
          <div style="text-align: center; margin: 25px 0;">
            <a href="${COMPANY.contactUrl}" style="display: inline-block; background: linear-gradient(135deg, #A88620, #C9A227); color: #0A1628; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Schedule a Consultation
            </a>
          </div>
          `}

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <div style="text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              ${COMPANY.name}
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              ${COMPANY.address}
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              ${COMPANY.phone} | <a href="${COMPANY.website}" style="color: #C9A227;">${COMPANY.website}</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send client confirmation email:', error);
  }
}

export async function sendLeadNotificationToAgent(
  agentEmail: string,
  agentName: string,
  clientName: string,
  clientEmail: string,
  clientPhone: string,
  packageId: string
): Promise<void> {
  const pkg = PACKAGES.find((p) => p.id === packageId || p.name === packageId);
  const packageName = pkg?.name || packageId;

  const transporter = await getTransporter(agentEmail);
  if (!transporter) {
    console.log('Email not configured for agent:', agentEmail);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"SASA Training System" <${agentEmail}>`,
      to: agentEmail,
      subject: `New Lead: ${clientName} - ${packageName}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A1628, #0D4785); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A227; margin: 0; font-size: 24px;">New Lead Alert!</h1>
          </div>

          <h2 style="color: #0D4785;">Hey ${agentName}!</h2>
          <p style="color: #333; line-height: 1.6;">
            You have a new lead interested in the <strong>${packageName}</strong>.
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0D4785; margin-top: 0;">Client Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${clientName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${clientEmail}">${clientEmail}</a></p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${clientPhone}</p>
            <p style="margin: 5px 0;"><strong>Package:</strong> ${packageName}</p>
          </div>

          <p style="color: #333; line-height: 1.6;">
            Log in to your dashboard to track and manage this lead.
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px; text-align: center;">
            SASA Training Course Leaderboard System
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send agent notification email:', error);
  }
}

export async function testEmailConnection(email: string, password: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: {
        user: email,
        pass: password,
      },
    });
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}
