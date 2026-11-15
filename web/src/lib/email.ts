/**
 * CodeThesis AI — Transactional Email Service
 * Powered by Resend API (https://resend.com)
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] RESEND_API_KEY is not defined in environment variables.');
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured in environment variables.',
    };
  }

  const sender = from || process.env.RESEND_FROM_EMAIL || 'CodeThesis AI <onboarding@resend.dev>';
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: recipients,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('[Resend] API Error:', data);
      return {
        success: false,
        error: data.message || 'Failed to dispatch email via Resend API.',
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err: any) {
    console.error('[Resend] Network exception sending email:', err);
    return {
      success: false,
      error: err.message || 'Network exception connecting to Resend.',
    };
  }
}

/**
 * Dispatch an Academic Password Reset Email
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName,
}: {
  to: string;
  resetUrl: string;
  userName?: string;
}): Promise<SendEmailResult> {
  const greeting = userName ? `Hello ${userName},` : 'Hello Researcher,';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Academic Access — CodeThesis AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 24px 12px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 2px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
    .header { background: #0F172A; padding: 28px 24px; text-align: center; }
    .brand-title { color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .brand-badge { background: #0284C7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
    .header-sub { color: #94A3B8; font-size: 12px; margin-top: 6px; letter-spacing: 0.5px; text-transform: uppercase; font-weight: 600; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .cta-container { text-align: center; margin: 32px 0; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #0284C7 0%, #0369A1 100%); color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }
    .link-alt { background: #F1F5F9; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #64748B; word-break: break-all; margin-top: 20px; border: 1px solid #CBD5E1; }
    .security-box { margin-top: 28px; padding: 16px; background: #FEF3C7; border-left: 4px solid #D97706; border-radius: 6px; font-size: 12px; color: #92400E; line-height: 1.5; }
    .footer { padding: 20px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">CodeThesis<span class="brand-badge">AI</span></div>
      <div class="header-sub">Build • Document • Defend</div>
    </div>
    <div class="content">
      <div class="greeting">${greeting}</div>
      <p class="text">
        We received an academic credential recovery request for your CodeThesis AI account. Click the button below to establish a new password and restore access to your research theses and oral defense simulations:
      </p>
      <div class="cta-container">
        <a href="${resetUrl}" class="cta-button" target="_blank">Reset Academic Password</a>
      </div>
      <div class="link-alt">
        <strong>Direct Link:</strong><br/>
        <a href="${resetUrl}" style="color: #0284C7; text-decoration: underline;">${resetUrl}</a>
      </div>
      <div class="security-box">
        <strong>Security Notice:</strong> This password recovery link will expire in <strong>60 minutes</strong>. If you did not initiate this request, no action is required — your current academic credentials remain completely secure.
      </div>
    </div>
    <div class="footer">
      © 2026 CodeThesis AI • The Undergraduate & Postgraduate Thesis Engineering Platform.<br/>
      Designed for institutional academic integrity and tertiary research excellence.
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: 'Reset Your Academic Access — CodeThesis AI',
    html,
  });
}

/**
 * Dispatch an Academic Welcome Onboarding Email
 */
export async function sendWelcomeEmail({
  to,
  fullName,
  starterCredits = 15,
}: {
  to: string;
  fullName: string;
  starterCredits?: number;
}): Promise<SendEmailResult> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CodeThesis AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 24px 12px; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 2px solid #E2E8F0; overflow: hidden; }
    .header { background: #0F172A; padding: 28px 24px; text-align: center; }
    .brand-title { color: #ffffff; font-size: 22px; font-weight: 800; }
    .brand-badge { background: #0284C7; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px; margin-left: 6px; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 800; color: #0F172A; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .credit-box { background: #F0FDF4; border: 2px solid #BBF7D0; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .credit-num { font-size: 32px; font-weight: 900; color: #16A34A; }
    .credit-label { font-size: 12px; font-weight: 700; color: #15803D; text-transform: uppercase; letter-spacing: 0.5px; }
    .cta-container { text-align: center; margin: 28px 0; }
    .cta-button { display: inline-block; background: #0284C7; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 10px; }
    .footer { padding: 20px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 11px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">CodeThesis<span class="brand-badge">AI</span></div>
    </div>
    <div class="content">
      <div class="greeting">Welcome, ${fullName}!</div>
      <p class="text">
        Your academic research account has been provisioned. You now have full access to our multi-model thesis builder, automated APA citation engine, and real-time oral defense Viva simulator.
      </p>
      <div class="credit-box">
        <div class="credit-num">${starterCredits}</div>
        <div class="credit-label">Free Starter Academic Credits Granted</div>
      </div>
      <div class="cta-container">
        <a href="https://codethesis.ai/dashboard" class="cta-button">Launch Academic Dashboard</a>
      </div>
    </div>
    <div class="footer">
      © 2026 CodeThesis AI • Build • Document • Defend
    </div>
  </div>
</body>
</html>
`;

  return sendEmail({
    to,
    subject: 'Welcome to CodeThesis AI — Starter Credits Granted',
    html,
  });
}
