import { Req, Res } from './_ai';

// Confirms a finished Checkout Session and reports which plan it bought.
// NOTE: this unlocks the browser that completed checkout. Moving to accounts
// (Supabase auth + a Stripe webhook) makes it follow the user across devices.
export default async function handler(req: Req, res: Res) {
  const key = process.env.STRIPE_SECRET_KEY;
  const id = req.query?.session_id;
  if (!key || !id || !/^cs_[A-Za-z0-9_]+$/.test(id)) return res.status(400).json({ plan: 'free' });
  const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, { headers: { authorization: `Bearer ${key}` } });
  if (!r.ok) return res.status(200).json({ plan: 'free' });
  const s = (await r.json()) as { status?: string; payment_status?: string; metadata?: { plan?: string } };
  const ok = s.status === 'complete' && (s.payment_status === 'paid' || s.payment_status === 'no_payment_required');
  return res.status(200).json({ plan: ok && (s.metadata?.plan === 'studio' || s.metadata?.plan === 'pro') ? s.metadata.plan : 'free' });
}
