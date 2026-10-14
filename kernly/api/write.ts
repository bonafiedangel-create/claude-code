import { Req, Res, claude, limited } from './_ai';

const KINDS = ['cover', 'point', 'list', 'steps', 'stat', 'quote', 'cta'];
const COUNT: Record<string, number> = { carousel: 7, post: 1, deck: 6 };

const SYSTEM = `You write slide copy for social carousels, single posts and decks.
Return ONLY valid JSON: {"slides":[...]} — no prose, no markdown fences.
Each slide: {"kind": one of ${KINDS.join('|')}, "title": string, "body"?: string, "items"?: string[], "stat"?: {"value": string, "label": string}}.
Rules:
- Wrap exactly ONE key word in each title with *asterisks*, e.g. "Stop designing *from scratch*".
- Titles max 60 characters. Bodies max 140 characters. One idea per slide.
- "steps" needs 3-5 short items (1-2 words each). "list" needs 3-5 items under 40 characters.
- "stat" needs a punchy value like "10×" or "6h" and a short label.
- First slide is "cover" (a hook). Last slide is "cta" with items:["Follow <handle>"] unless it is a single post.
- Write in the brand voice given. Concrete, specific, no filler, no emoji.`;

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (limited(req)) return res.status(429).json({ error: 'Slow down a little.' });
  const { topic, voice, brandName, handle, format } = req.body ?? {};
  if (!topic || typeof topic !== 'string' || topic.length > 300) return res.status(400).json({ error: 'Bad topic' });
  const n = COUNT[format] ?? 7;
  try {
    const text = await claude(
      SYSTEM,
      `Topic: ${topic}\nBrand: ${String(brandName).slice(0, 60)} (${String(handle).slice(0, 40)})\nVoice: ${String(voice).slice(0, 80)}\nFormat: ${format}\nSlides: exactly ${n}`,
    );
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const slides = (json.slides as any[])
      .filter((s) => KINDS.includes(s.kind) && typeof s.title === 'string')
      .slice(0, n);
    if (!slides.length) throw new Error('empty');
    return res.status(200).json({ slides });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
