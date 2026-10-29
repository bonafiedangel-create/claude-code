export type Signature = 'italic' | 'highlight' | 'sticker' | 'label' | 'bar' | 'colour';

export interface Brand {
  id: string;
  name: string;
  handle: string;
  accent: string;
  ground: string;
  text: string;
  headFont: string;
  bodyFont: string;
  signature: Signature;
  voice: string;
  logo?: string;
}

export type Format = 'carousel' | 'post' | 'deck';
export type SlideKind = 'cover' | 'point' | 'list' | 'steps' | 'stat' | 'quote' | 'cta' | 'compare' | 'chart';

export interface Slide {
  kind: SlideKind;
  title: string;
  body?: string;
  items?: string[];
  stat?: { value: string; label: string };
  kicker?: string;
  image?: string;
}

export interface Doc {
  id: string;
  title: string;
  format: Format;
  styleId: string;
  brandId: string;
  slides: Slide[];
  image?: string;
  updatedAt: number;
}

export type Plan = 'free' | 'pro' | 'studio';

export const FORMATS: Record<Format, { label: string; w: number; h: number; hint: string }> = {
  carousel: { label: 'Carousel', w: 1080, h: 1350, hint: '4:5 · Instagram, LinkedIn' },
  post: { label: 'Single post', w: 1080, h: 1080, hint: '1:1 · any feed' },
  deck: { label: 'Deck', w: 1920, h: 1080, hint: '16:9 · presentations' },
};

export const SLIDE_KINDS: { id: SlideKind; label: string }[] = [
  { id: 'cover', label: 'Cover' },
  { id: 'point', label: 'Big point' },
  { id: 'list', label: 'List' },
  { id: 'steps', label: 'Steps chart' },
  { id: 'stat', label: 'Stat + curve' },
  { id: 'quote', label: 'Quote' },
  { id: 'compare', label: 'Compare (A vs B)' },
  { id: 'chart', label: 'Bar chart' },
  { id: 'cta', label: 'Call to action' },
];

export const SIGNATURES: { id: Signature; label: string }[] = [
  { id: 'italic', label: 'Italic twist' },
  { id: 'highlight', label: 'Highlight' },
  { id: 'sticker', label: 'Sticker' },
  { id: 'label', label: 'Label dot' },
  { id: 'bar', label: 'Accent bar' },
  { id: 'colour', label: 'Colour word' },
];

export const VOICES = [
  { id: 'calm', label: 'Calm · precise · warm' },
  { id: 'bold', label: 'Bold · direct · playful' },
  { id: 'expert', label: 'Expert · clear · no fluff' },
  { id: 'friendly', label: 'Friendly · simple · encouraging' },
];

export const HEAD_FONTS = [
  'Inter Tight', 'Space Grotesk', 'Bricolage Grotesque', 'Archivo', 'Syne', 'Sora',
  'Manrope', 'Fraunces', 'DM Serif Display', 'Instrument Serif', 'Playfair Display',
];
export const BODY_FONTS = ['Same as headline', 'Inter', 'Manrope', 'DM Sans', 'Georgia', 'Helvetica'];

export const PLANS: Record<Plan, { label: string; price: string; brands: number; blurb: string }> = {
  free: { label: 'Free', price: '$0', brands: 1, blurb: 'Try everything with examples' },
  pro: { label: 'Pro', price: '$12/mo', brands: 3, blurb: 'Save, export clean, write with AI' },
  studio: { label: 'Studio', price: '$29/mo', brands: 99, blurb: 'Unlimited brands for agencies' },
};
