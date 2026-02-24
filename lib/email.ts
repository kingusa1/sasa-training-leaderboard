import { Resend } from 'resend';
import { PACKAGES } from './constants';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = 'SASA Training <onboarding@resend.dev>';

export async function sendLeadConfirmationToClient(
  clientEmail: string,
  clientName: string,
  agentName: string,
  packageId: string
): Promise<void> {
  const pkg = PACKAGES.find((p) => p.id === packageId || p.name === packageId);
  const packageName = pkg?.name || packageId;
  const packagePrice = pkg ? `$${pkg.price.toLocaleString()}` : '';

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: clientEmail,
      subject: `Thank you for your interest in ${packageName}!`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A1628, #0F2340); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A227; margin: 0; font-size: 24px;">SASA Training</h1>
          </div>
          <h2 style="color: #0F2340;">Hello ${clientName}!</h2>
          <p style="color: #333; line-height: 1.6;">
            Thank you for your interest in the <strong>${packageName}</strong>${packagePrice ? ` (${packagePrice})` : ''}.
          </p>
          <p style="color: #333; line-height: 1.6;">
            Your dedicated training consultant <strong>${agentName}</strong> will be in touch with you shortly to discuss the next steps.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0F2340; margin-top: 0;">What happens next?</h3>
            <ol style="color: #555; line-height: 1.8;">
              <li>Your consultant will reach out to schedule a meeting</li>
              <li>You'll discuss the course details and any questions</li>
              <li>Upon enrollment, you'll receive full access</li>
            </ol>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            SASA Training Course | Building Tomorrow's Sales Leaders
          </p>
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

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: agentEmail,
      subject: `New Lead: ${clientName} - ${packageName}`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A1628, #0F2340); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #C9A227; margin: 0; font-size: 24px;">New Lead Alert!</h1>
          </div>
          <h2 style="color: #0F2340;">Hey ${agentName}!</h2>
          <p style="color: #333; line-height: 1.6;">
            You have a new lead interested in the <strong>${packageName}</strong>.
          </p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0F2340; margin-top: 0;">Client Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${clientName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${clientEmail}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${clientPhone}</p>
            <p style="margin: 5px 0;"><strong>Package:</strong> ${packageName}</p>
          </div>
          <p style="color: #333; line-height: 1.6;">
            Log in to your dashboard to track and manage this lead.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            SASA Training Course Leaderboard
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send agent notification email:', error);
  }
}
