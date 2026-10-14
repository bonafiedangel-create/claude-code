import { Req, Res } from './_ai';

// Create the price IDs in Stripe, then set these env vars in Vercel.
const PRICES: Record<string, string | undefined> = {
  'pro:month': process.env.STRIPE_PRICE_PRO_MONTH,
  'pro:year': process.env.STRIPE_PRICE_PRO_YEAR,
  'studio:month': process.env.STRIPE_PRICE_STUDIO_MONTH,
  'studio:year': process.env.STRIPE_PRICE_STUDIO_YEAR,
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.STRIPE_SECRET_KEY;
  const { plan, interval } = req.body ?? {};
  const price = PRICES[`${plan}:${interval}`];
  if (!key || !price) return res.status(500).json({ error: 'Checkout is not configured yet.' });
  const origin = `https://${req.headers.host}`;
  const form = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: `${origin}/?paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
    allow_promotion_codes: 'true',
    'metadata[plan]': plan,
  });
  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const data = (await r.json()) as { url?: string; error?: { message: string } };
  if (!r.ok || !data.url) return res.status(502).json({ error: data.error?.message ?? 'Stripe error' });
  return res.status(200).json({ url: data.url });
}
