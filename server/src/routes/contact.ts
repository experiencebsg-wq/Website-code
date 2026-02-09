import { Router, Request, Response } from 'express';
import { Resend } from 'resend';
import { prisma } from '../lib/prisma.js';

const router = Router();

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const CONTACT_EMAIL_TO = process.env.CONTACT_EMAIL_TO?.trim() || 'experienceBSG@gmail.com';
const COMPANY_NAME = 'BSG Beelicious Signatures Global';
const WEBSITE = 'experienceBSG.com';
const FROM_LABEL = process.env.RESEND_FROM?.trim() || 'BSG Contact <contact@experiencebsg.com>';
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return typeof email === 'string' && email.length <= 254 && EMAIL_REGEX.test(email.trim());
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function companyEmailHtml(name: string, email: string, phone: string | null, subject: string, message: string): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = phone ? escapeHtml(phone) : '';
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New contact message</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #d4af37; font-size: 20px; letter-spacing: 0.1em; font-weight: 600;">${escapeHtml(COMPANY_NAME)}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 0.15em;">YOUR CUSTOMIZED EXPERIENCE</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 24px; color: #1a1a1a; font-size: 18px;">New contact form message</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">From</td></tr>
                <tr><td style="padding: 0 0 16px; color: #1a1a1a; font-size: 15px;"><strong>${safeName}</strong> &lt;${safeEmail}&gt;</td></tr>
                ${safePhone ? `<tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Phone</td></tr><tr><td style="padding: 0 0 16px; color: #1a1a1a; font-size: 15px;">${safePhone}</td></tr>` : ''}
                <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Subject</td></tr>
                <tr><td style="padding: 0 0 16px; color: #1a1a1a; font-size: 15px;">${safeSubject}</td></tr>
                <tr><td style="padding: 8px 0; color: #666; font-size: 13px;">Message</td></tr>
                <tr><td style="padding: 16px 0 0; color: #1a1a1a; font-size: 15px; line-height: 1.6;">${safeMessage}</td></tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 12px; color: #999;">Reply directly to this email to respond to ${safeName}.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #999;">${escapeHtml(COMPANY_NAME)} · ${escapeHtml(WEBSITE)} · experienceBSG@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function userConfirmationEmailHtml(name: string): string {
  const safeName = escapeHtml(name);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We received your message</title>
</head>
<body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin:0; color: #d4af37; font-size: 20px; letter-spacing: 0.1em; font-weight: 600;">${escapeHtml(COMPANY_NAME)}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 0.15em;">YOUR CUSTOMIZED EXPERIENCE</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 20px;">We received your message</h2>
              <p style="margin: 0 0 16px; color: #444; font-size: 15px; line-height: 1.6;">Dear ${safeName},</p>
              <p style="margin: 0 0 16px; color: #444; font-size: 15px; line-height: 1.6;">Thank you for getting in touch with BSG Beelicious Signatures Global. We have received your message and will get back to you as soon as possible.</p>
              <p style="margin: 0 0 24px; color: #444; font-size: 15px; line-height: 1.6;">If your inquiry is urgent, you can reach us directly at <a href="mailto:experienceBSG@gmail.com" style="color: #d4af37;">experienceBSG@gmail.com</a>.</p>
              <p style="margin: 0; color: #444; font-size: 15px; line-height: 1.6;">Best regards,<br /><strong>BSG Beelicious Signatures Global</strong></p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #999;">${escapeHtml(COMPANY_NAME)} · <a href="https://${escapeHtml(WEBSITE)}" style="color: #d4af37;">${escapeHtml(WEBSITE)}</a> · experienceBSG@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// POST /contact - submit contact form (saves to DB, sends to company + confirmation to user)
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body as { name: string; email: string; phone?: string; subject: string; message: string };
    let { name, email, subject, message, phone } = body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'Missing required fields: name, email, subject, message' });
      return;
    }
    name = name.trim();
    email = email.trim().toLowerCase();
    subject = subject.trim();
    message = message.trim();
    phone = phone?.trim() || null;

    if (!isValidEmail(email)) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    const from = process.env.RESEND_FROM?.trim() || FROM_LABEL;

    if (resend) {
      // 1. Send to company (experienceBSG@gmail.com)
      const companyHtml = companyEmailHtml(name, email, phone, subject, message);
      const { error: err1 } = await resend.emails.send({
        from,
        to: [CONTACT_EMAIL_TO],
        replyTo: email,
        subject: `[Contact – ${WEBSITE}] ${subject}`,
        html: companyHtml,
      });
      if (err1) console.error('Resend (company) contact email failed:', err1);

      // 2. Send confirmation copy to the user who submitted the form
      const userHtml = userConfirmationEmailHtml(name);
      const { error: err2 } = await resend.emails.send({
        from,
        to: [email],
        subject: `We received your message – ${COMPANY_NAME}`,
        html: userHtml,
      });
      if (err2) console.error('Resend (user copy) contact email failed:', err2);
    }

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you shortly. A confirmation has been sent to your email.',
    });
  } catch (e) {
    console.error('POST /contact', e);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

export default router;
