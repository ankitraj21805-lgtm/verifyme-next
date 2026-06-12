import { getSql } from '@/lib/db';
import { orderEmailHtml, sendEmail, siteUrl } from '@/lib/email';

export async function POST(req) {
  try {
    const body = await req.json();
    const { service_id, client_name, client_email, client_whatsapp, project_details } = body;
    if (!service_id || !client_name || !client_whatsapp || !project_details) {
      return Response.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const sql = getSql();
    const orders = await sql`
      INSERT INTO orders (service_id, client_name, client_email, client_whatsapp, project_details)
      VALUES (${Number(service_id)}, ${client_name}, ${client_email || ''}, ${client_whatsapp}, ${project_details})
      RETURNING *
    `;
    const order = orders[0];

    const serviceRows = await sql`SELECT title, category, price FROM services WHERE id=${Number(service_id)} LIMIT 1`;
    const service = serviceRows[0] || {};
    const trackUrl = `${siteUrl()}/track?orderId=${order.id}`;

    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New VerifyMe order #${order.id} from ${client_name}`,
      html: orderEmailHtml({
        title: 'New VerifyMe Order Received',
        order: { ...order, service_title: service.title },
        serviceTitle: service.title,
        message: `A new order was submitted on VerifyMe. Details: ${project_details}`
      })
    });

    if (client_email) {
      await sendEmail({
        to: client_email,
        subject: `VerifyMe order #${order.id} received`,
        html: orderEmailHtml({
          title: 'Your VerifyMe Order Is Received',
          order: { ...order, service_title: service.title },
          serviceTitle: service.title,
          message: `Hi ${client_name}, your order has been received. Current status is PENDING. Track it here: ${trackUrl}`
        })
      });
    }

    return Response.json({
      order: { ...order, service_title: service.title, service_category: service.category, service_price: service.price },
      trackUrl,
      message: 'Order submitted successfully. Save your Order ID to track status.'
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
