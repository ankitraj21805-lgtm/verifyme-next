import { getSql } from '@/lib/db';

function normalizePhone(value = '') {
  return String(value).replace(/\D/g, '').slice(-10);
}

export async function GET(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id) return Response.json({ error: 'Valid order ID is required' }, { status: 400 });

    const url = new URL(req.url);
    const phone = url.searchParams.get('phone') || '';
    const sql = getSql();

    const rows = await sql`
      SELECT
        o.id,
        o.client_name,
        o.client_email,
        o.client_whatsapp,
        o.project_details,
        o.status,
        o.created_at,
        s.title AS service_title,
        s.category AS service_category,
        s.price AS service_price,
        p.status AS payment_status,
        p.reference_id AS payment_reference
      FROM orders o
      LEFT JOIN services s ON s.id = o.service_id
      LEFT JOIN LATERAL (
        SELECT status, reference_id FROM payment_references
        WHERE order_id = o.id
        ORDER BY created_at DESC
        LIMIT 1
      ) p ON true
      WHERE o.id = ${id}
      LIMIT 1
    `;

    if (!rows.length) return Response.json({ error: 'Order not found' }, { status: 404 });

    const order = rows[0];
    const phoneMatches = phone && normalizePhone(phone) === normalizePhone(order.client_whatsapp);

    if (!phoneMatches) {
      return Response.json({
        order: {
          id: order.id,
          status: order.status,
          payment_status: order.payment_status || 'NOT_SUBMITTED',
          service_title: order.service_title,
          service_category: order.service_category,
          service_price: order.service_price,
          created_at: order.created_at
        },
        limited: true,
        message: 'Add WhatsApp number to view full order details.'
      });
    }

    return Response.json({ order: { ...order, payment_status: order.payment_status || 'NOT_SUBMITTED' }, limited: false });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
