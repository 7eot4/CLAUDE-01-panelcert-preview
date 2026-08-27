import { Resend } from "resend";

function client(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "PanelCert <orders@panelcert.com>";
}

export async function sendOrderDeliveryEmail(params: {
  to: string;
  customerName: string | null;
  productName: string;
  tierName: string;
  downloadUrl: string;
  expiresInDays: number;
}) {
  const { to, customerName, productName, tierName, downloadUrl, expiresInDays } = params;
  const greeting = customerName ? `Hi ${customerName},` : "Hi,";

  await client().emails.send({
    from: fromAddress(),
    to,
    subject: `Your ${productName} (${tierName}) is ready`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <p>${greeting}</p>
        <p>Thanks for your purchase. Your <strong>${productName} — ${tierName}</strong> is ready to download.</p>
        <p style="margin: 24px 0;">
          <a href="${downloadUrl}" style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
            Download your toolkit
          </a>
        </p>
        <p style="color:#555;font-size:14px;">This link expires in ${expiresInDays} days. If it expires, reply to this email and we'll send a fresh one — no questions asked.</p>
        <p style="color:#555;font-size:14px;">Questions or an issue opening the file? Just reply to this email.</p>
        <p>— PanelCert</p>
      </div>
    `,
  });
}

export async function sendOrderFailedNotice(params: { to: string; productName: string }) {
  const { to, productName } = params;
  await client().emails.send({
    from: fromAddress(),
    to,
    subject: `There was an issue with your ${productName} order`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <p>Hi,</p>
        <p>Your payment for <strong>${productName}</strong> did not complete successfully, so nothing was delivered and nothing was charged.</p>
        <p>If you'd like to try again, you can restart checkout from the pricing page. If you think this is a mistake, just reply to this email.</p>
        <p>— PanelCert</p>
      </div>
    `,
  });
}
