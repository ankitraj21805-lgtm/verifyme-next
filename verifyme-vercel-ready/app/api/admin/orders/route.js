import { requireAdmin } from '@/lib/auth';
import { getSql } from '@/lib/db';
export async function PATCH(req){ const unauth=requireAdmin(); if(unauth) return unauth; try{const {id,status}=await req.json(); const sql=getSql(); const rows=await sql`UPDATE orders SET status=${status} WHERE id=${Number(id)} RETURNING *`; return Response.json({order:rows[0]});}catch(e){return Response.json({error:e.message},{status:500})}}
