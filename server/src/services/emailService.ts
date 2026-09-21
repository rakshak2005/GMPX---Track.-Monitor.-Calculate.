import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

export interface EmailPayload {
  to?: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {

  if (transporter) return transporter;

  const user = env.GMAIL_USER;
  const pass = env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return transporter;
}

/**
 * Send an email notification via Gmail SMTP (100% Free with Google App Password)
 */
export async function sendGmailNotification(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  const recipient = payload.to || env.GMAIL_NOTIFY_TO || env.GMAIL_USER;

  if (!recipient) {
    return {
      success: false,
      message: 'Recipient email is missing. Provide a recipient or set GMAIL_NOTIFY_TO / GMAIL_USER in .env',
    };
  }

  const mailer = getTransporter();
  if (!mailer) {
    return {
      success: false,
      message: 'Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env.',
    };
  }

  try {
    const info = await mailer.sendMail({
      from: `"GMPX Allotment Desk" <${env.GMAIL_USER}>`,
      to: recipient,
      subject: payload.subject,
      text: payload.text,
      html: payload.html || `<p>${payload.text.replace(/\n/g, '<br>')}</p>`,
    });

    return {
      success: true,
      message: `Email alert sent successfully! (Message ID: ${info.messageId})`,
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      message: `Failed to send Gmail: ${err.message}`,
    };
  }
}

/**
 * Format email HTML and text for allotment alert
 */
export function formatEmailAllotmentAlert(
  ipoName: string,
  status: 'ALLOTTED' | 'NOT_ALLOTTED',
  shares?: number,
  registrar?: string
): { subject: string; text: string; html: string } {
  const isAllotted = status === 'ALLOTTED';
  const subject = isAllotted
    ? `🎉 [ALLOTTED] ${ipoName} - Official Allotment Confirmed!`
    : `📢 [UPDATE] ${ipoName} - Allotment Result Declared (Not Allotted)`;

  const text = isAllotted
    ? `Congratulations!\n\nYou have been ALLOTTED shares for ${ipoName}.\n\nStatus: ALLOTTED\nShares Allotted: ${shares || 'Standard Lot'}\nRegistrar: ${registrar || 'Official Registrar'}\nMandate/Demat: Shares will be credited to your demat account prior to listing day.\n\nTrack listing gain and live GMP on GMPX Terminal.`
    : `Allotment Update for ${ipoName}\n\nStatus: NOT ALLOTTED\nShares: 0\nRegistrar: ${registrar || 'Official Registrar'}\nMandate/Lien: UPI mandate bank lien hold will be released automatically within 24-48 hours.\n\nTrack upcoming IPO opportunities on GMPX Terminal.`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #060913; padding: 30px 15px;">
        <tr>
          <td align="center">
            <!-- Main Card Container -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #0f172a 0%, #0b1120 100%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
              
              <!-- Brand Header -->
              <tr>
                <td style="padding: 24px 28px 18px 28px; border-bottom: 1px solid rgba(255, 255, 255, 0.07);">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-size: 18px; font-weight: 800; letter-spacing: 1px; color: #38bdf8;">GMPX</span>
                        <span style="font-size: 12px; font-weight: 600; color: #94a3b8; margin-left: 6px; letter-spacing: 0.5px;">ALLOTMENT INTELLIGENCE</span>
                      </td>
                      <td align="right">
                        <span style="font-size: 10px; font-weight: 700; color: #10b981; background-color: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); padding: 4px 8px; border-radius: 6px; letter-spacing: 0.5px;">
                          7:00 PM AUTO-POLLER
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Hero Status Banner -->
              <tr>
                <td style="padding: 28px 28px 20px 28px; text-align: center;">
                  <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 14px; ${isAllotted ? 'background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);' : 'background: rgba(244, 63, 94, 0.15); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3);'}">
                    ${isAllotted ? '🎉 ALLOTMENT SUCCESS' : '📢 ALLOTMENT NOTICE'}
                  </div>
                  <h1 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                    ${ipoName}
                  </h1>
                  <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                    ${isAllotted ? 'Your application has been chosen in the registrar lottery draw.' : 'Allotment lottery completed by the issue registrar.'}
                  </p>
                </td>
              </tr>

              <!-- Status Details Box -->
              <tr>
                <td style="padding: 0 28px 24px 28px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080d1a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px 20px;">
                    <tr>
                      <td style="padding: 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Allotment Status</td>
                      <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 800; color: ${isAllotted ? '#34d399' : '#fb7185'};">
                        ${isAllotted ? 'ALLOTTED' : 'NOT ALLOTTED'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Shares Allotted</td>
                      <td align="right" style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 14px; font-weight: 800; color: #ffffff;">
                        ${isAllotted ? (shares || 'Standard Lot') + ' Shares' : '0 Shares'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Registrar</td>
                      <td align="right" style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; font-weight: 600; color: #38bdf8;">
                        ${registrar || 'Official Registrar'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Bank / Mandate Action</td>
                      <td align="right" style="padding: 8px 0; border-top: 1px solid rgba(255, 255, 255, 0.05); font-size: 12px; font-weight: 600; color: #cbd5e1;">
                        ${isAllotted ? 'Funds debited • Demat credit pre-listing' : 'Lien unblocked in 24-48 hrs'}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer CTA -->
              <tr>
                <td style="padding: 0 28px 28px 28px; text-align: center;">
                  <a href="https://gmpx-track-monitor-calculate.vercel.app/allotment" style="display: block; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);">
                    Open Allotment Desk &amp; GMP Terminal &rarr;
                  </a>
                  <p style="margin: 18px 0 0 0; font-size: 11px; color: #475569; line-height: 1.5;">
                    This automated alert was dispatched by your 7:00 PM IST Automated Poller Pipeline.<br>
                    To modify your registered PAN or notification email, visit your GMPX Terminal Settings.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { subject, text, html };
}
