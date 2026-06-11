import { getSql, fallbackServices } from '@/lib/db';

export async function GET() {
  try {
    const sql = getSql();
    const services = await sql`SELECT id, title, description, category, price FROM services ORDER BY id ASC`;
    return Response.json({ services });
  } catch (e) {
    return Response.json({ services: fallbackServices, warning: e.message }, { status: 200 });
  }
}
