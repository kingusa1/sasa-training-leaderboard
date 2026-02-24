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

// Shared email wrapper with SASA branding
function emailWrapper(headerTitle: string, headerSubtitle: string, bodyContent: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f0ede8; font-family: 'Segoe UI', 'Inter', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0ede8; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #001829 0%, #002E59 40%, #004686 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 20px;">
                          <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: 2px;">SASA</span>
                          <span style="color: rgba(255,255,255,0.6); font-size: 18px; font-weight: 300; letter-spacing: 2px;"> WORLDWIDE</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">${headerTitle}</h1>
                    <p style="color: rgba(204,224,235,0.8); margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">${headerSubtitle}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 35px 30px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafaf8; padding: 25px 30px; border-radius: 0 0 16px 16px; border-top: 1px solid #f0ede8;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="color: #888; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">${COMPANY.name}</p>
                    <p style="color: #aaa; font-size: 12px; margin: 0 0 4px 0;">${COMPANY.address}</p>
                    <p style="color: #aaa; font-size: 12px; margin: 0 0 10px 0;">${COMPANY.phone}</p>
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 0 8px;">
                          <a href="${COMPANY.website}" style="color: #004686; font-size: 12px; text-decoration: none;">Website</a>
                        </td>
                        <td style="color: #ddd; font-size: 12px;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="${COMPANY.trainingUrl}" style="color: #004686; font-size: 12px; text-decoration: none;">Training</a>
                        </td>
                        <td style="color: #ddd; font-size: 12px;">|</td>
                        <td style="padding: 0 8px;">
                          <a href="${COMPANY.contactUrl}" style="color: #004686; font-size: 12px; text-decoration: none;">Contact</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Build package details HTML block
function packageDetailsBlock(pkg: typeof PACKAGES[0]) {
  const featuresHtml = pkg.features.map((f) => `
    <tr>
      <td style="padding: 6px 0; vertical-align: top; width: 24px;">
        <div style="width: 18px; height: 18px; background-color: #e8f4f0; border-radius: 50%; text-align: center; line-height: 18px; font-size: 11px; color: #14758A;">&#10003;</div>
      </td>
      <td style="padding: 6px 0 6px 10px; color: #444; font-size: 14px; line-height: 1.4;">${f}</td>
    </tr>
  `).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fc, #f0f4f8); border-radius: 12px; border: 1px solid #e8edf2; margin: 20px 0;">
      <tr>
        <td style="padding: 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="color: #004686; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 6px 0;">Selected Package</p>
                <h3 style="color: #002E59; font-size: 20px; font-weight: 700; margin: 0 0 4px 0;">${pkg.name}</h3>
                <p style="color: #888; font-size: 13px; margin: 0 0 4px 0;">${pkg.fullName}</p>
                ${pkg.price > 0
                  ? `<p style="color: #004686; font-size: 22px; font-weight: 700; margin: 8px 0 0 0;">AED ${pkg.price.toLocaleString()} <span style="font-size: 12px; font-weight: 400; color: #999;">one-time payment</span></p>`
                  : `<p style="color: #004686; font-size: 18px; font-weight: 700; margin: 8px 0 0 0;">Custom Pricing <span style="font-size: 12px; font-weight: 400; color: #999;">tailored for your team</span></p>`
                }
              </td>
            </tr>
          </table>
          <div style="border-top: 1px solid #e0e5ea; margin: 16px 0;"></div>
          <p style="color: #555; font-size: 13px; line-height: 1.6; margin: 0 0 14px 0;">${pkg.description}</p>
          <p style="color: #002E59; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px 0;">What&rsquo;s Included</p>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            ${featuresHtml}
          </table>
        </td>
      </tr>
    </table>
  `;
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
  const enrollUrl = pkg?.enrollUrl;

  const transporter = await getTransporter(agentEmail);
  if (!transporter) {
    console.log('Email not configured for agent:', agentEmail);
    return;
  }

  const bodyContent = `
    <!-- Greeting -->
    <h2 style="color: #002E59; font-size: 22px; margin: 0 0 6px 0;">Hello ${clientName}!</h2>
    <p style="color: #888; font-size: 14px; margin: 0 0 20px 0;">Thank you for your interest in SASA Sales Training</p>

    <p style="color: #444; font-size: 15px; line-height: 1.7; margin: 0 0 5px 0;">
      We&rsquo;re excited that you&rsquo;re taking the first step toward transforming your sales career. Your dedicated training consultant <strong style="color: #002E59;">${agentName}</strong> will be in touch shortly.
    </p>

    <!-- Package Details -->
    ${pkg ? packageDetailsBlock(pkg) : `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fc; border-radius: 12px; border: 1px solid #e8edf2; margin: 20px 0;">
        <tr>
          <td style="padding: 24px;">
            <p style="color: #004686; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 6px 0;">Selected Package</p>
            <h3 style="color: #002E59; font-size: 20px; font-weight: 700; margin: 0;">${packageName}</h3>
          </td>
        </tr>
      </table>
    `}

    <!-- Your Consultant -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fefdfb; border: 1px solid #f0ede8; border-radius: 12px; margin: 20px 0;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 16px;">
                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #004686, #14758A); border-radius: 50%; text-align: center; line-height: 48px; color: #ffffff; font-size: 20px; font-weight: 700;">
                  ${agentName.charAt(0)}
                </div>
              </td>
              <td style="vertical-align: middle;">
                <p style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 3px 0;">Your Dedicated Consultant</p>
                <p style="color: #002E59; font-size: 16px; font-weight: 700; margin: 0;">${agentName}</p>
                <p style="color: #004686; font-size: 13px; margin: 2px 0 0 0;">${agentEmail}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Next Steps -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td>
          <p style="color: #002E59; font-size: 16px; font-weight: 700; margin: 0 0 16px 0;">What Happens Next?</p>
        </td>
      </tr>
      <tr>
        <td>
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="width: 28px; height: 28px; background: #002E59; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 13px; font-weight: 700;">1</div>
              </td>
              <td style="padding: 10px 0 10px 12px; vertical-align: middle;">
                <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Consultation Call</p>
                <p style="color: #888; font-size: 13px; margin: 2px 0 0 0;">Your consultant will reach out to schedule a meeting</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="width: 28px; height: 28px; background: #004686; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 13px; font-weight: 700;">2</div>
              </td>
              <td style="padding: 10px 0 10px 12px; vertical-align: middle;">
                <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Personalized Walkthrough</p>
                <p style="color: #888; font-size: 13px; margin: 2px 0 0 0;">Discuss the program, your goals, and get all your questions answered</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; vertical-align: top; width: 36px;">
                <div style="width: 28px; height: 28px; background: #14758A; border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 13px; font-weight: 700;">3</div>
              </td>
              <td style="padding: 10px 0 10px 12px; vertical-align: middle;">
                <p style="color: #333; font-size: 14px; margin: 0; font-weight: 600;">Start Your Training</p>
                <p style="color: #888; font-size: 13px; margin: 2px 0 0 0;">Upon enrollment, you&rsquo;ll receive instant access to all course materials</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 10px 0 0 0;">
      <tr>
        <td align="center">
          ${enrollUrl ? `
            <a href="${enrollUrl}" style="display: inline-block; background: linear-gradient(135deg, #002E59, #004686); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
              Enroll Now &rarr;
            </a>
          ` : `
            <a href="${COMPANY.contactUrl}" style="display: inline-block; background: linear-gradient(135deg, #002E59, #004686); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
              Schedule a Consultation &rarr;
            </a>
          `}
          <p style="color: #bbb; font-size: 12px; margin: 12px 0 0 0;">Or reply to this email to contact your consultant directly</p>
        </td>
      </tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from: `"${agentName} - SASA Worldwide" <${agentEmail}>`,
      to: clientEmail,
      subject: `Welcome to SASA Training — ${pkg?.name || packageId} Program`,
      html: emailWrapper('Welcome to SASA Training', 'Your journey to sales mastery starts here', bodyContent),
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
  const priceText = pkg && pkg.price > 0 ? `AED ${pkg.price.toLocaleString()}` : 'Custom';

  const transporter = await getTransporter(agentEmail);
  if (!transporter) {
    console.log('Email not configured for agent:', agentEmail);
    return;
  }

  const bodyContent = `
    <!-- Alert -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #e8f5e9, #f1f8e9); border-radius: 12px; border: 1px solid #c8e6c9; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="vertical-align: middle; padding-right: 12px; font-size: 24px;">&#127881;</td>
              <td style="vertical-align: middle;">
                <p style="color: #2e7d32; font-size: 15px; font-weight: 700; margin: 0;">New Lead Captured!</p>
                <p style="color: #558b2f; font-size: 13px; margin: 2px 0 0 0;">A new prospect is interested in your training program</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <h2 style="color: #002E59; font-size: 20px; margin: 0 0 20px 0;">Hey ${agentName}!</h2>

    <!-- Client Info Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #fafbfc; border-radius: 12px; border: 1px solid #eef0f2; margin: 0 0 20px 0;">
      <tr>
        <td style="padding: 24px;">
          <p style="color: #004686; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 14px 0;">Client Details</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</span><br>
                <span style="color: #002E59; font-size: 15px; font-weight: 600;">${clientName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span><br>
                <a href="mailto:${clientEmail}" style="color: #004686; font-size: 15px; font-weight: 600; text-decoration: none;">${clientEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <span style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Phone</span><br>
                <a href="tel:${clientPhone}" style="color: #004686; font-size: 15px; font-weight: 600; text-decoration: none;">${clientPhone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0;">
                <span style="color: #999; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Package Interest</span><br>
                <span style="color: #002E59; font-size: 15px; font-weight: 600;">${packageName}</span>
                <span style="color: #004686; font-size: 14px; font-weight: 600; margin-left: 8px;">${priceText}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Quick Actions -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 0 0 8px 0;">
          <a href="mailto:${clientEmail}" style="display: inline-block; background: linear-gradient(135deg, #002E59, #004686); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 700; font-size: 15px;">
            Email Client &rarr;
          </a>
        </td>
      </tr>
      <tr>
        <td align="center">
          <a href="tel:${clientPhone}" style="display: inline-block; border: 2px solid #004686; color: #004686; text-decoration: none; padding: 12px 36px; border-radius: 12px; font-weight: 600; font-size: 14px;">
            Call Client
          </a>
        </td>
      </tr>
    </table>

    <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
      Log in to your <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://sasa-training-leaderboard.vercel.app'}/dashboard" style="color: #004686; text-decoration: none; font-weight: 600;">dashboard</a> to manage all your leads.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"SASA Training System" <${agentEmail}>`,
      to: agentEmail,
      subject: `New Lead: ${clientName} — ${packageName} (${priceText})`,
      html: emailWrapper('New Lead Alert', `${clientName} is interested in ${packageName}`, bodyContent),
    });
  } catch (error) {
    console.error('Failed to send agent notification email:', error);
  }
}

export async function sendMeetingConfirmationToClient(
  agentEmail: string,
  clientEmail: string,
  clientName: string,
  agentName: string,
  packageId: string,
  preferredDate: string,
  preferredTime: string
): Promise<void> {
  const pkg = PACKAGES.find((p) => p.id === packageId || p.name === packageId);

  // Format date nicely
  let formattedDate = preferredDate;
  try {
    const d = new Date(preferredDate);
    formattedDate = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    // Keep original if parsing fails
  }

  // Format time to 12h
  let formattedTime = preferredTime;
  try {
    const [h, m] = preferredTime.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    formattedTime = `${h12}:${m} ${ampm}`;
  } catch {
    // Keep original if parsing fails
  }

  const transporter = await getTransporter(agentEmail);
  if (!transporter) {
    console.log('Email not configured for agent:', agentEmail);
    return;
  }

  const bodyContent = `
    <!-- Confirmed Badge -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: #e8f5e9; border-radius: 50px; padding: 10px 24px;">
                <span style="color: #2e7d32; font-size: 14px; font-weight: 700;">&#10003; Meeting Confirmed</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <h2 style="color: #002E59; font-size: 22px; margin: 0 0 6px 0;">Hello ${clientName}!</h2>
    <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Your consultation has been confirmed. Here are the complete details for your upcoming meeting.
    </p>

    <!-- Meeting Details Card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9fc, #f0f4f8); border-radius: 12px; border: 1px solid #e0e5ea; margin: 0 0 24px 0;">
      <tr>
        <td style="padding: 28px;">
          <p style="color: #004686; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 18px 0;">Meeting Details</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8edf2;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px; font-size: 20px;">&#128197;</td>
                    <td style="vertical-align: middle;">
                      <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Date</p>
                      <p style="color: #002E59; font-size: 16px; font-weight: 700; margin: 2px 0 0 0;">${formattedDate}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e8edf2;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px; font-size: 20px;">&#128339;</td>
                    <td style="vertical-align: middle;">
                      <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Time</p>
                      <p style="color: #002E59; font-size: 16px; font-weight: 700; margin: 2px 0 0 0;">${formattedTime}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 12px; font-size: 20px;">&#128100;</td>
                    <td style="vertical-align: middle;">
                      <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Your Consultant</p>
                      <p style="color: #002E59; font-size: 16px; font-weight: 700; margin: 2px 0 0 0;">${agentName}</p>
                      <p style="color: #004686; font-size: 13px; margin: 2px 0 0 0;">${agentEmail}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Package Info -->
    ${pkg ? packageDetailsBlock(pkg) : ''}

    <!-- What to Expect -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left: 4px solid #004686; margin: 24px 0;">
      <tr>
        <td style="padding: 16px 20px; background: #fafbfc; border-radius: 0 8px 8px 0;">
          <p style="color: #002E59; font-size: 15px; font-weight: 700; margin: 0 0 8px 0;">What to Expect</p>
          <p style="color: #666; font-size: 14px; line-height: 1.7; margin: 0;">
            During your consultation, your dedicated consultant will walk you through the program in detail, answer all your questions, and help you determine the best training path for your career goals. No pressure &mdash; just a friendly, informative conversation.
          </p>
        </td>
      </tr>
    </table>

    <!-- Reschedule Note -->
    <p style="color: #999; font-size: 13px; text-align: center; margin: 24px 0 0 0;">
      Need to reschedule? Simply reply to this email or contact your consultant directly.
    </p>
  `;

  try {
    await transporter.sendMail({
      from: `"${agentName} - SASA Worldwide" <${agentEmail}>`,
      to: clientEmail,
      subject: `Meeting Confirmed — ${formattedDate} at ${formattedTime}`,
      html: emailWrapper('Meeting Confirmed', `${formattedDate} at ${formattedTime}`, bodyContent),
    });
  } catch (error) {
    console.error('Failed to send meeting confirmation email:', error);
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
