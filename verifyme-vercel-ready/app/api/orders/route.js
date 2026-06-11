import { getSql } from '@/lib/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const { service_id, client_name, client_email, client_whatsapp, project_details } = body;
    if (!service_id || !client_name || !client_whatsapp || !project_details) return Response.json({ error: 'Required fields missing' }, { status: 400 });
    const sql = getSql();
    const rows = await sql`INSERT INTO orders (service_id, client_name, client_email, client_whatsapp, project_details) VALUES (${Number(service_id)}, ${client_name}, ${client_email || ''}, ${client_whatsapp}, ${project_details}) RETURNING *`;
    return Response.json({ order: rows[0] });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
