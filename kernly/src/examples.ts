import { Doc } from './types';

const now = () => Date.now();

export const EXAMPLES: Doc[] = [
  {
    id: 'ex-carousel',
    title: 'Example · Content system carousel',
    format: 'carousel',
    styleId: 'glow',
    brandId: 'brand-1',
    updatedAt: now(),
    slides: [
      { kind: 'cover', title: 'Stop designing every post *from scratch*', body: 'A four-step system for creators who post often.' },
      { kind: 'point', title: 'Your brand is a *decision*, made once', body: 'Pick colours, fonts and a voice one time. After that, every post is just words.' },
      { kind: 'steps', title: 'Build it in *four* moves', items: ['Brand', 'Style', 'Visual', 'Format'] },
      { kind: 'stat', title: 'Same look, *every* post', stat: { value: '10×', label: 'faster than a blank canvas' }, body: 'Hours saved per week, compounding.' },
      { kind: 'list', title: 'What goes in the *kit*', items: ['Two colours and a ground', 'One headline font, one body font', 'One signature detail', 'Three words for your voice'] },
      { kind: 'quote', title: 'Consistency beats *creativity* on a tight deadline.', body: 'Every busy creator' },
      { kind: 'cta', title: 'Make yours *today*', body: 'Build the kit once. Reuse it forever.', items: ['Follow @yourbrand'] },
    ],
  },
  {
    id: 'ex-post',
    title: 'Example · Single hook post',
    format: 'post',
    styleId: 'brutal',
    brandId: 'brand-1',
    updatedAt: now(),
    slides: [{ kind: 'cover', title: 'One idea. One slide. *Zero* fluff.', body: 'If it needs a second paragraph, it needs a second post.' }],
  },
  {
    id: 'ex-deck',
    title: 'Example · Pitch deck',
    format: 'deck',
    styleId: 'blueprint',
    brandId: 'brand-1',
    updatedAt: now(),
    slides: [
      { kind: 'cover', title: 'The *content system* behind 30 posts a month', body: 'Brand kit · Templates · AI copy' },
      { kind: 'point', title: 'Creators lose hours to *formatting*, not ideas', body: 'Resizing, recolouring, re-explaining the same style to every tool.' },
      { kind: 'steps', title: 'One kit, *four* formats', items: ['Brand', 'Carousel', 'Post', 'Deck'] },
      { kind: 'stat', title: 'Hours saved *per week*', stat: { value: '6h', label: 'back in your calendar' } },
      { kind: 'list', title: 'What you get', items: ['A brand kit that restyles everything', 'Copy written in your voice', 'Clean exports: PNG, PDF, ZIP'] },
      { kind: 'cta', title: 'Start with *one* post', items: ['Try it free'] },
    ],
  },
];
