import { Brand, Doc, Format, Slide } from './types';

export interface Template {
  id: string;
  name: string;
  category: 'Carousels' | 'Single posts' | 'Decks';
  format: Format;
  styleId: string;
  blurb: string;
  isNew?: boolean;
  build: (topic: string, brand: Brand) => Slide[];
}

const T = (t: string) => (t.trim() || 'content').toLowerCase();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const TEMPLATES: Template[] = [
  {
    id: 'tips',
    name: 'Hook + 5 tips',
    category: 'Carousels',
    format: 'carousel',
    styleId: 'glow',
    blurb: 'The classic save-worthy list',
    build: (t) => [
      { kind: 'cover', title: `5 ${T(t)} tips I wish I knew *sooner*`, body: 'Save this before you scroll.' },
      { kind: 'point', title: 'Start with the *outcome*', body: 'Decide what “good” looks like before you do anything else.' },
      { kind: 'point', title: 'Make it *smaller*', body: 'Cut the task in half, then half again. Momentum beats ambition.' },
      { kind: 'point', title: 'Use one *system*', body: 'One template, one checklist, one place for everything.' },
      { kind: 'point', title: 'Review *weekly*', body: 'Ten minutes on Friday saves hours next week.' },
      { kind: 'point', title: 'Ship before it feels *ready*', body: 'You learn more from one published post than five drafts.' },
      { kind: 'cta', title: 'Which one will you *try*?', body: 'Tell me in the comments.', items: ['Follow for more'] },
    ],
  },
  {
    id: 'myth',
    name: 'Myth vs reality',
    category: 'Carousels',
    format: 'carousel',
    styleId: 'brutal',
    blurb: 'Challenge a common belief',
    isNew: true,
    build: (t) => [
      { kind: 'cover', title: `The biggest ${T(t)} *myths*`, body: 'What people believe vs what actually works.' },
      { kind: 'compare', title: 'Myth vs *reality*', items: ['Myth || Reality', 'You need more tools || You need one clear system', 'Post every day || Post on a schedule you can keep', 'Be everywhere || Win one place first'] },
      { kind: 'point', title: 'Simple beats *clever*', body: 'Boring, repeatable habits outperform bursts of inspiration.' },
      { kind: 'cta', title: 'Which myth fooled *you*?', items: ['Comment below'] },
    ],
  },
  {
    id: 'data',
    name: 'Data story',
    category: 'Carousels',
    format: 'carousel',
    styleId: 'graph',
    blurb: 'Numbers with a clear takeaway',
    isNew: true,
    build: (t) => [
      { kind: 'cover', title: `What the numbers say about ${T(t)}`, body: 'A 60-second read.' },
      { kind: 'stat', title: 'The headline *number*', stat: { value: '68%', label: 'saw results in 30 days' }, body: 'Across the people we tracked.' },
      { kind: 'chart', title: 'Where the *gains* came from', items: ['Planning: 34', 'Consistency: 52', 'Quality: 21', 'Promotion: 17'], body: 'Consistency won by a wide margin.' },
      { kind: 'point', title: 'The takeaway', body: 'Do the simple thing, on schedule, for longer than feels comfortable.' },
      { kind: 'cta', title: 'Want the *full* data?', items: ['Link in bio'] },
    ],
  },
  {
    id: 'steps',
    name: 'Step by step',
    category: 'Carousels',
    format: 'carousel',
    styleId: 'blueprint',
    blurb: 'A process with a stair chart',
    build: (t) => [
      { kind: 'cover', title: `How to get started with ${T(t)}`, body: 'Four steps. No fluff.' },
      { kind: 'steps', title: 'The *four* steps', items: ['Plan', 'Build', 'Test', 'Launch'] },
      { kind: 'list', title: 'Before you *begin*', items: ['Write down one goal', 'Block two focused hours', 'Gather what you need', 'Tell someone you are doing it'] },
      { kind: 'cta', title: 'Ready? *Go.*', items: ['Save this'] },
    ],
  },
  {
    id: 'notes',
    name: 'Notebook lesson',
    category: 'Carousels',
    format: 'carousel',
    styleId: 'notebook',
    blurb: 'Handwritten, personal, warm',
    isNew: true,
    build: (t) => [
      { kind: 'cover', title: `my 3 rules for ${T(t)}`, body: 'learned the hard way' },
      { kind: 'point', title: '1. one idea per *slide*', body: 'if it needs two sentences, split it.' },
      { kind: 'point', title: '2. never *“title + bullets”*', body: 'say it like you would to a friend.' },
      { kind: 'point', title: '3. teach it *once*', body: 'then reuse the style every time.' },
      { kind: 'cta', title: 'try it *tonight*', items: ['Follow along'] },
    ],
  },
  {
    id: 'hook',
    name: 'One-line hook',
    category: 'Single posts',
    format: 'post',
    styleId: 'sticker',
    blurb: 'A bold statement, nothing else',
    build: (t) => [{ kind: 'cover', title: `Nobody tells you this about ${T(t)}`, body: 'So here it is.' }],
  },
  {
    id: 'photoquote',
    name: 'Photo quote',
    category: 'Single posts',
    format: 'post',
    styleId: 'photo',
    blurb: 'Your photo with a big quote',
    isNew: true,
    build: (t) => [{ kind: 'quote', title: `The best ${T(t)} advice I ever got: *start*.`, body: 'Add your photo from the Style tab' }],
  },
  {
    id: 'bigstat',
    name: 'Big stat',
    category: 'Single posts',
    format: 'post',
    styleId: 'glow',
    blurb: 'One number that stops the scroll',
    build: (t) => [{ kind: 'stat', title: `${cap(T(t))}, in one *number*`, stat: { value: '3×', label: 'faster with a system' }, body: 'Same effort, better output.' }],
  },
  {
    id: 'pitch',
    name: 'Pitch deck',
    category: 'Decks',
    format: 'deck',
    styleId: 'blueprint',
    blurb: 'Problem, solution, proof, ask',
    build: (t) => [
      { kind: 'cover', title: `${cap(T(t))}: the *opportunity*`, body: 'A five-minute overview' },
      { kind: 'point', title: 'The *problem*', body: 'People spend hours on work that should take minutes.' },
      { kind: 'steps', title: 'Our *approach*', items: ['Capture', 'Systemise', 'Automate', 'Scale'] },
      { kind: 'stat', title: 'The *proof*', stat: { value: '6h', label: 'saved per week' } },
      { kind: 'chart', title: 'Growth by *quarter*', items: ['Q1: 12', 'Q2: 31', 'Q3: 58', 'Q4: 96'] },
      { kind: 'cta', title: 'Let’s *talk*', items: ['hello@yourbrand.com'] },
    ],
  },
  {
    id: 'casestudy',
    name: 'Case study',
    category: 'Decks',
    format: 'deck',
    styleId: 'editorial',
    blurb: 'Before, after, and how',
    isNew: true,
    build: (t) => [
      { kind: 'cover', title: `How we improved ${T(t)} in *30 days*`, body: 'A short case study' },
      { kind: 'compare', title: 'Before and *after*', items: ['Before || After', 'Scattered effort || One clear plan', 'Slow turnaround || Same-day delivery', 'Inconsistent look || Fully on-brand'] },
      { kind: 'chart', title: 'The *results*', items: ['Reach: 82', 'Saves: 64', 'Clicks: 47', 'Replies: 29'] },
      { kind: 'quote', title: 'It changed how we *work*.', body: 'A happy client' },
      { kind: 'cta', title: 'Want results like *this*?', items: ['Get in touch'] },
    ],
  },
];

export function buildDoc(tpl: Template, topic: string, brand: Brand): Doc {
  return {
    id: Math.random().toString(36).slice(2, 10),
    title: tpl.name,
    format: tpl.format,
    styleId: tpl.styleId,
    brandId: brand.id,
    slides: tpl.build(topic, brand),
    updatedAt: Date.now(),
  };
}
