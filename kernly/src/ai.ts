import { Brand, Format, Slide } from './types';
import { voiceId } from './brand';

type V = 'calm' | 'bold' | 'expert' | 'friendly';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const COVER: Record<V, (t: string) => string> = {
  calm: (t) => `${cap(t)}, made *simple*`,
  bold: (t) => `Stop guessing at ${t}. Do *this* instead`,
  expert: (t) => `${cap(t)}: what *actually* works`,
  friendly: (t) => `Your *friendly* guide to ${t}`,
};
const COVER_BODY: Record<V, string> = {
  calm: 'A quieter, clearer way to get it right.',
  bold: 'No fluff. Just the moves that work.',
  expert: 'Five ideas, in the order that matters.',
  friendly: 'You can do this — here is where to start.',
};
const BODIES: Record<V, string[]> = {
  calm: [
    'Most of the stress comes from starting with tactics. Begin with one clear decision instead.',
    'Choose a single idea and give it room. Everything else can wait.',
    'People remember what they can picture. Show it before you explain it.',
  ],
  bold: [
    'You are overthinking it. Pick a lane, commit, and ship.',
    'One idea per post. Two ideas is a muddle. Zero ideas is noise.',
    'Nobody reads walls of text. Make it visual or make it shorter.',
  ],
  expert: [
    'Start from the outcome, then work backwards to the smallest set of actions that gets you there.',
    'Each unit of content should carry exactly one idea, stated plainly in the first line.',
    'Show the mechanism. A simple diagram beats a paragraph of explanation.',
  ],
  friendly: [
    'It feels big because you are looking at the whole thing. Take it one small step at a time.',
    'Start with just one idea. You can always add more once it feels easy.',
    'A quick picture helps everyone follow along. Keep it simple and kind.',
  ],
};
const CTA: Record<V, string> = {
  calm: 'Take the first *step* today',
  bold: 'Go make it *happen*',
  expert: 'Put it into *practice*',
  friendly: 'Ready to *start*?',
};

export function localWrite(topic: string, brand: Brand, format: Format): Slide[] {
  const t = (topic.trim() || 'your content').toLowerCase();
  const v = voiceId(brand.voice);
  const b = BODIES[v];
  const cover: Slide = { kind: 'cover', title: COVER[v](t), body: COVER_BODY[v] };
  const cta: Slide = { kind: 'cta', title: CTA[v], body: `Save this for later and share it with someone who needs it.`, items: [`Follow ${brand.handle}`] };
  if (format === 'post') return [{ ...cover, kind: 'cover' }];
  const core: Slide[] = [
    { kind: 'point', title: `Why ${t} feels *harder* than it is`, body: b[0] },
    { kind: 'steps', title: 'Build it in *four* moves', items: ['Plan', 'Write', 'Design', 'Post'] },
    { kind: 'point', title: 'Start with *one* clear idea', body: b[1] },
    { kind: 'stat', title: 'Small system, *big* difference', stat: { value: '3×', label: 'more consistent' }, body: b[2] },
    { kind: 'list', title: `Your ${t} checklist`, items: ['Pick one goal', 'Write one hook', 'Use one style', 'Post on a schedule'] },
  ];
  return format === 'deck' ? [cover, ...core.slice(0, 4), cta] : [cover, ...core, cta];
}

export interface WriteResult {
  slides: Slide[];
  source: 'ai' | 'offline';
}

/** Tries the AI endpoint first, falls back to the built-in writer so the tool never dead-ends. */
export async function writeDeck(topic: string, brand: Brand, format: Format, plan: string): Promise<WriteResult> {
  try {
    const res = await fetch('/api/write', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic, voice: brand.voice, brandName: brand.name, handle: brand.handle, format, plan }),
    });
    if (res.ok) {
      const data = (await res.json()) as { slides?: Slide[] };
      if (Array.isArray(data.slides) && data.slides.length) return { slides: data.slides, source: 'ai' };
    }
  } catch {
    /* offline or no server — fall through */
  }
  return { slides: localWrite(topic, brand, format), source: 'offline' };
}

export type RewriteMode = 'shorter' | 'bolder' | 'calmer' | 'warmer';

export async function rewrite(text: string, mode: RewriteMode, brand: Brand, plan: string): Promise<string | null> {
  try {
    const res = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text, mode, voice: brand.voice, plan }),
    });
    if (res.ok) {
      const data = (await res.json()) as { text?: string };
      if (data.text) return data.text;
    }
  } catch {
    /* ignore */
  }
  if (mode === 'shorter') {
    const first = text.split(/(?<=[.!?])\s+/)[0] ?? text;
    return first.length < text.length ? first : text;
  }
  return null; // tone rewrites genuinely need the AI endpoint
}
