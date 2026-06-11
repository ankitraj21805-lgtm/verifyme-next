import { requireAdmin } from '@/lib/auth';
import { getSql } from '@/lib/db';

export async function GET() {
  const unauth = requireAdmin(); if (unauth) return unauth;
  try {
    const sql = getSql();
    const orders = await sql`SELECT o.*, s.title AS service_title, s.category AS service_category FROM orders o LEFT JOIN services s ON s.id=o.service_id ORDER BY o.created_at DESC`;
    const payments = await sql`SELECT p.*, o.client_name FROM payment_references p LEFT JOIN orders o ON o.id=p.order_id ORDER BY p.created_at DESC`;
    const services = await sql`SELECT * FROM services ORDER BY id ASC`;
    return Response.json({ orders, payments, services });
  } catch (e) { return Response.json({ error:e.message }, { status:500 }); }
}
