// The Weekly Signal signup: adds the email to the Klaviyo list (single opt-in).
import type { APIRoute } from 'astro';
import { settings } from '../../lib/data';
import { limited, clientIp, json } from '../../lib/store';

export const prerender = false;

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string> = {};
  try {
    body = request.headers.get('content-type')?.includes('json')
      ? await request.json()
      : (Object.fromEntries(await request.formData()) as Record<string, string>);
  } catch {
    return json({ message: 'We could not read that. Please try again.' }, 400);
  }
  const email = String(body.email || '')
    .trim()
    .toLowerCase();

  // Bots: the hidden field is filled, or the form came back faster than a person can type.
  const tooFast = body.t && Date.now() - Number(body.t) < 2000;
  if (body.website || tooFast) return json({ ok: true });

  if (!EMAIL.test(email) || email.length > 200) return json({ message: 'Please enter a full email address, like name@example.com.' }, 400);
  if (await limited(`sub:${clientIp(request)}`, 5, 3600))
    return json({ message: 'That is a few tries in a row. Please wait a little and try again.' }, 429);

  const key = import.meta.env.KLAVIYO_PUBLIC_KEY || settings.klaviyoPublicKey;
  const listId = import.meta.env.KLAVIYO_LIST_ID || settings.klaviyoListId;
  const res = await fetch(`https://a.klaviyo.com/client/subscriptions?company_id=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/vnd.api+json', accept: 'application/vnd.api+json', revision: '2024-10-15' },
    body: JSON.stringify({
      data: {
        type: 'subscription',
        attributes: {
          custom_source: 'Link in bio',
          profile: { data: { type: 'profile', attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } } } },
        },
        relationships: { list: { data: { type: 'list', id: listId } } },
      },
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    console.error('Klaviyo subscribe failed', res?.status, await res?.text().catch(() => ''));
    return json({ message: 'The list is not answering right now. Please try again in a few minutes.' }, 502);
  }
  return json({ ok: true });
};
