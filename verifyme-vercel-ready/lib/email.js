function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export function siteUrl() {
  return getSiteUrl();
}

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'VerifyMe <onboarding@resend.dev>';

  if (!apiKey || !to) {
    console.log('[email skipped]', { to, subject, reason: !apiKey ? 'RESEND_API_KEY missing' : 'recipient missing' });
    return { skipped: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('[email failed]', text);
      return { skipped: false, error: text };
    }

    return { ok: true };
  } catch (error) {
    console.error('[email error]', error);
    return { skipped: false, error: error.message };
  }
}

export function orderEmailHtml({ title, order, serviceTitle, message }) {
  const url = `${getSiteUrl()}/track?orderId=${order.id}`;
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>${title}</h2>
      <p>${message}</p>
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:16px 0;background:#f9fafb">
        <p><b>Order ID:</b> #${order.id}</p>
        <p><b>Name:</b> ${order.client_name}</p>
        <p><b>WhatsApp:</b> ${order.client_whatsapp || '-'}</p>
        <p><b>Service:</b> ${serviceTitle || order.service_title || 'Selected service'}</p>
        <p><b>Status:</b> ${order.status || 'PENDING'}</p>
      </div>
      <p>You can track your order here: <a href="${url}">${url}</a></p>
      <p>For fast support, contact on WhatsApp: <a href="https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919244076460'}">Chat with VerifyMe</a></p>
      <p>— VerifyMe</p>
    </div>
  `;
}
