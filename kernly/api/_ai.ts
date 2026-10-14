// Shared helpers for the serverless endpoints. Runs on Vercel's Node runtime.
type Req = { method?: string; body?: any; headers: Record<string, string | string[] | undefined>; query?: Record<string, string> };
type Res = { status: (n: number) => Res; json: (v: unknown) => void; setHeader: (k: string, v: string) => void };
export type { Req, Res };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5';

// Best-effort abuse cap per IP. Replace with per-account quotas once login exists.
const hits = new Map<string, { n: number; t: number }>();
export function limited(req: Req, max = 20): boolean {
  const ip = String(req.headers['x-forwarded-for'] || 'local').split(',')[0].trim();
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.t > 3_600_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  h.n += 1;
  return h.n > max;
}

export async function claude(system: string, user: string, maxTokens = 1800): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY is not set');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
  });
  if (!r.ok) throw new Error(`Anthropic ${r.status}`);
  const data = (await r.json()) as { content: { type: string; text?: string }[] };
  return data.content.filter((c) => c.type === 'text').map((c) => c.text).join('');
}
