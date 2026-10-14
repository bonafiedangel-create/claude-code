import { Req, Res, claude, limited } from './_ai';

const MODES: Record<string, string> = {
  shorter: 'Make it shorter. Keep the meaning.',
  bolder: 'Make it bolder, more direct and confident.',
  calmer: 'Make it calmer, gentler and more measured.',
  warmer: 'Make it warmer and more human.',
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (limited(req, 60)) return res.status(429).json({ error: 'Slow down a little.' });
  const { text, mode, voice } = req.body ?? {};
  if (!text || typeof text !== 'string' || text.length > 600 || !MODES[mode]) return res.status(400).json({ error: 'Bad request' });
  try {
    const out = await claude(
      'You rewrite one piece of slide copy. Return ONLY the rewritten text. Keep any *asterisk-wrapped* key word marked. No quotes, no commentary.',
      `Brand voice: ${String(voice).slice(0, 80)}\nInstruction: ${MODES[mode]}\nText: ${text}`,
      400,
    );
    return res.status(200).json({ text: out.trim() });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
}
