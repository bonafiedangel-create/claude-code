import { Brand, VOICES } from './types';

export const SERIF = ['Fraunces', 'DM Serif Display', 'Instrument Serif', 'Playfair Display', 'Georgia'];

export function fontStack(name: string): string {
  const fallback = SERIF.includes(name) ? 'Georgia, serif' : 'system-ui, -apple-system, sans-serif';
  return `'${name}', ${fallback}`;
}

export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace";

export const resolveBody = (b: Brand) => (b.bodyFont === 'Same as headline' ? b.headFont : b.bodyFont);

export function voiceId(voice: string): 'calm' | 'bold' | 'expert' | 'friendly' {
  const hit = VOICES.find((v) => v.label === voice);
  if (hit) return hit.id as 'calm';
  const l = voice.toLowerCase();
  if (/bold|direct|playful|punch/.test(l)) return 'bold';
  if (/calm|warm|gentle|soft/.test(l)) return 'calm';
  if (/friend|simple|encourag|kind/.test(l)) return 'friendly';
  return 'expert';
}

export const DEFAULT_BRAND: Brand = {
  id: 'brand-1',
  name: 'Your Brand',
  handle: '@yourbrand',
  accent: '#ff5b1f',
  ground: '#f7f2ea',
  text: '#15121a',
  headFont: 'Inter Tight',
  bodyFont: 'Same as headline',
  signature: 'italic',
  voice: VOICES[2].label,
};

export const BRAND_PRESETS: { name: string; accent: string; ground: string; text: string; headFont: string }[] = [
  { name: 'Tangerine', accent: '#ff5b1f', ground: '#f7f2ea', text: '#15121a', headFont: 'Inter Tight' },
  { name: 'Violet', accent: '#7c6cff', ground: '#f6f2ea', text: '#1c1b20', headFont: 'Bricolage Grotesque' },
  { name: 'Lime', accent: '#c6f432', ground: '#101010', text: '#f5f5ef', headFont: 'Archivo' },
  { name: 'Forest', accent: '#1f6f4a', ground: '#eef3ea', text: '#10231a', headFont: 'Fraunces' },
  { name: 'Rose', accent: '#e23c6a', ground: '#fff3f0', text: '#2a1218', headFont: 'DM Serif Display' },
  { name: 'Ink', accent: '#2f5bff', ground: '#ffffff', text: '#0c0f1a', headFont: 'Space Grotesk' },
];

export function brandDocument(b: Brand): string {
  const body = resolveBody(b);
  return [
    `BRAND DOCUMENT — ${b.name} (${b.handle})`,
    `Ground: ${b.ground}. Text: ${b.text}. Accent: ${b.accent} — use once per slide, only on what matters.`,
    `Headline font: ${b.headFont}. Body font: ${body}. Labels: JetBrains Mono, uppercase, wide tracking.`,
    `Signature: ${b.signature} — mark exactly one key word per headline.`,
    `Voice: ${b.voice}. Short sentences. One idea per slide. No filler.`,
  ].join('\n');
}
