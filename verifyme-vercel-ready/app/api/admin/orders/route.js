import { requireAdmin } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { orderEmailHtml, sendEmail } from '@/lib/email';

export async function PATCH(req) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  try {
    const { id, status } = await req.json();
    const sql = getSql();

    const rows = await sql`UPDATE orders SET status=${status} WHERE id=${Number(id)} RETURNING *`;
    const order = rows[0];

    if (order?.client_email) {
      const serviceRows = await sql`SELECT title FROM services WHERE id=${order.service_id} LIMIT 1`;
      const serviceTitle = serviceRows[0]?.title || 'Selected service';

      await sendEmail({
        to: order.client_email,
        subject: `VerifyMe order #${order.id} status updated: ${status}`,
        html: orderEmailHtml({
          title: 'Your VerifyMe Order Status Was Updated',
          order: { ...order, service_title: serviceTitle },
          serviceTitle,
          message: `Hi ${order.client_name}, your order status is now ${status}. You can track your order anytime using the link below.`
        })
      });
    }

    return Response.json({ order });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
