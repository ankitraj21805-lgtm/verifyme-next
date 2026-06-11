import { cookies } from 'next/headers';

export function isAdmin() {
  const token = cookies().get('verifyme_admin')?.value;
  return Boolean(token && process.env.ADMIN_SESSION_SECRET && token === process.env.ADMIN_SESSION_SECRET);
}

export function requireAdmin() {
  if (!isAdmin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
