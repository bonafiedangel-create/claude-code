// Media kit requests: emailed to the inbox set in MEDIA_KIT_TO, through Resend.
import type { APIRoute } from 'astro';
import { limited, clientIp, json } from '../../lib/store';

export const prerender = false;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const POST: APIRoute = async ({ request }) => {
  let b: Record<string, string> = {};
  try {
    b = await request.json();
  } catch {
    return json({ message: 'We could not read that. Please try again.' }, 400);
  }
  if (b.website || (b.t && Date.now() - Number(b.t) < 3000)) return json({ ok: true });

  const f = {
    name: String(b.name || '')
      .trim()
      .slice(0, 120),
    brand: String(b.brand || '')
      .trim()
      .slice(0, 120),
    email: String(b.email || '')
      .trim()
      .slice(0, 200),
    budget: String(b.budget || 'Not given')
      .trim()
      .slice(0, 60),
    message: String(b.message || '')
      .trim()
      .slice(0, 4000),
  };
  if (!f.name || !f.brand || !f.message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email))
    return json({ message: 'Please add your name, brand, email and a short message.' }, 400);
  if (await limited(`mk:${clientIp(request)}`, 3, 3600)) return json({ message: 'Thank you, we already have your request.' }, 429);

  const key = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.MEDIA_KIT_TO;
  if (!key || !to) {
    console.error('Media kit form: RESEND_API_KEY or MEDIA_KIT_TO is not set');
    return json({ message: 'This form is not connected yet. Please call the business line instead.' }, 503);
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: import.meta.env.MEDIA_KIT_FROM || 'Link in bio <onboarding@resend.dev>',
      to: to.split(',').map((s: string) => s.trim()),
      reply_to: f.email,
      subject: `Media kit request: ${f.brand}`,
      html: `<p><b>Name:</b> ${esc(f.name)}<br><b>Brand:</b> ${esc(f.brand)}<br><b>Email:</b> ${esc(f.email)}<br><b>Budget:</b> ${esc(f.budget)}</p><p>${esc(f.message).replace(/\n/g, '<br>')}</p>`,
    }),
  }).catch(() => null);
  if (!res || !res.ok) {
    console.error('Resend failed', res?.status, await res?.text().catch(() => ''));
    return json({ message: 'The message did not go through. Please try again, or call the business line.' }, 502);
  }
  return json({ ok: true });
};
