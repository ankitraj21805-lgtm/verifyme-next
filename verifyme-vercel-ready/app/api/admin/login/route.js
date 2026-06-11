import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { password } = await req.json();
    if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) return Response.json({ error: 'Admin env variables missing' }, { status: 500 });
    if (password !== process.env.ADMIN_PASSWORD) return Response.json({ error: 'Wrong password' }, { status: 401 });
    cookies().set('verifyme_admin', process.env.ADMIN_SESSION_SECRET, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return Response.json({ ok: true });
  } catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
}
