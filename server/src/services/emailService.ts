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
    ? `🎉 ALLOTTED: ${ipoName} - IPO Allotment Declared!`
    : `📢 Allotment Update: ${ipoName} - Not Allotted`;

  const text = isAllotted
    ? `Congratulations!\n\nYou have been ALLOTTED shares for ${ipoName}.\n\nShares Allotted: ${shares || 'Standard Lot'}\nRegistrar: ${registrar || 'Official Registrar'}\nAction: Please check your demat account or bank lien status.\n\nView live GMP on GMPX Terminal.`
    : `Allotment Update for ${ipoName}\n\nStatus: NOT ALLOTTED\nShares: 0\nBank/UPI mandate lien will be released within 24-48 hours.\nRegistrar: ${registrar || 'Official Registrar'}\n\nTrack upcoming IPOs on GMPX Terminal.`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px; max-width: 600px; margin: auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: ${isAllotted ? '#10b981' : '#94a3b8'}; margin: 0; font-size: 24px;">
          ${isAllotted ? '🎉 Allotment Confirmed!' : '📢 Allotment Notice'}
        </h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 4px;">GMPX Automated Allotment Alert Engine</p>
      </div>

      <div style="background-color: #1e293b; border-radius: 8px; padding: 20px; border: 1px solid #334155;">
        <h2 style="margin: 0 0 16px 0; color: #38bdf8; font-size: 18px;">${ipoName}</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Status:</td>
            <td style="padding: 8px 0; font-weight: bold; color: ${isAllotted ? '#34d399' : '#f87171'};">
              ${isAllotted ? 'ALLOTTED' : 'NOT ALLOTTED'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Shares:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #f8fafc;">${isAllotted ? (shares || 'Standard Lot') : '0'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Registrar:</td>
            <td style="padding: 8px 0; color: #f8fafc;">${registrar || 'Official Registrar'}</td>
          </tr>
        </table>
      </div>

      <p style="margin-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
        ${isAllotted ? 'Your demat account will be credited before listing day.' : 'UPI mandate lien hold will be automatically unblocked by your bank.'}
      </p>
    </div>
  `;

  return { subject, text, html };
}
