import { cookies } from 'next/headers';
export async function POST(){ cookies().delete('verifyme_admin'); return Response.json({ ok:true }); }
