'use server';

import nodemailer from 'nodemailer';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('[email] SMTP not configured — skipping send:', payload.subject);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    ...payload,
  });
}

export async function notifyAdminAccessRequest({
  requesterName,
  requesterEmail,
  type,
  targetName,
  labName,
  message,
  adminUrl,
}: {
  requesterName: string;
  requesterEmail: string;
  type: 'LAB' | 'EQUIPMENT';
  targetName: string;
  labName?: string;
  message?: string;
  adminUrl: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const subject =
    type === 'LAB'
      ? `Access Request: Lab "${targetName}" from ${requesterName}`
      : `Access Request: Equipment "${targetName}" from ${requesterName}`;

  const body = `
A new access request has been submitted.

Type: ${type === 'LAB' ? 'Lab Access' : 'Equipment Access'}
${type === 'LAB' ? `Lab: ${targetName}` : `Equipment: ${targetName}${labName ? ` (${labName})` : ''}`}
Requester: ${requesterName} <${requesterEmail}>
${message ? `Message: ${message}` : ''}

Review and approve/deny this request in the admin panel:
${adminUrl}
  `.trim();

  await sendEmail({ to: adminEmail, subject, text: body });
}
