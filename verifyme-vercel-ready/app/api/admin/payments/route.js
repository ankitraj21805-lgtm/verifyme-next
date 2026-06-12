import { requireAdmin } from '@/lib/auth';
import { getSql } from '@/lib/db';
import { orderEmailHtml, sendEmail } from '@/lib/email';

export async function PATCH(req) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  try {
    const { id, status } = await req.json();
    const sql = getSql();

    const rows = await sql`UPDATE payment_references SET status=${status} WHERE id=${Number(id)} RETURNING *`;
    const payment = rows[0];

    if (payment?.order_id) {
      const orderRows = await sql`
        SELECT o.*, s.title AS service_title
        FROM orders o
        LEFT JOIN services s ON s.id = o.service_id
        WHERE o.id=${payment.order_id}
        LIMIT 1
      `;
      const order = orderRows[0];

      if (order?.client_email) {
        await sendEmail({
          to: order.client_email,
          subject: `VerifyMe payment for order #${order.id}: ${status}`,
          html: orderEmailHtml({
            title: 'Your VerifyMe Payment Status Was Updated',
            order: { ...order, status: order.status, service_title: order.service_title },
            serviceTitle: order.service_title,
            message: `Hi ${order.client_name}, your payment reference status is now ${status}. Your order status is ${order.status}.`
          })
        });
      }
    }

    return Response.json({ payment });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
