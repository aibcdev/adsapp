import { config } from "../config.js";

const RESEND_API = "https://api.resend.com/emails";
const FROM = process.env.AIBC_EMAIL_FROM || "AIBC Media <hello@aibcmedia.com>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    if (config.devBypass) {
      console.info(`[email:dev] To: ${opts.to}\nSubject: ${opts.subject}\n${opts.html}`);
      return { ok: true };
    }
    return { ok: false, error: "Email is not configured (set RESEND_API_KEY)" };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { ok: false, error: body || `Email send failed (${res.status})` };
  }
  return { ok: true };
}

export function welcomeEmailHtml(email: string): string {
  return `<p>Welcome to AIBC Media, ${email}.</p>
<p>Install the extension, sign in, and start earning when sponsor lines appear in your AI spinner.</p>
<p><a href="${config.portalUrl}">Open your dashboard</a></p>`;
}

export function magicLinkEmailHtml(link: string): string {
  return `<p>Sign in to AIBC Media:</p>
<p><a href="${link}">Continue to your dashboard</a></p>
<p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`;
}

export function passwordResetEmailHtml(link: string): string {
  return `<p>Reset your AIBC Media password:</p>
<p><a href="${link}">Choose a new password</a></p>
<p>This link expires in 1 hour. If you did not request this, ignore this email.</p>`;
}
