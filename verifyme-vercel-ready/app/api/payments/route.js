import { getSql } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { order_id, reference_id, screenshot_url } = body;
    if (!order_id || !reference_id) return Response.json({ error: 'Order ID and payment reference are required' }, { status: 400 });
    const sql = getSql();
    const rows = await sql`INSERT INTO payment_references (order_id, reference_id, screenshot_url) VALUES (${Number(order_id)}, ${reference_id}, ${screenshot_url || ''}) RETURNING *`;
    return Response.json({ payment: rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
