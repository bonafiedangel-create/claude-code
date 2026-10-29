import type { ReactNode } from 'react';
import { Brand, Slide } from './types';
import { alpha, mix, onDark, readableOn } from './color';

export interface Theme {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  accentInk: string;
  panel: string;
  line: string;
}

export interface StyleDef {
  id: string;
  name: string;
  blurb: string;
  theme: (b: Brand) => Theme;
  background: (t: Theme, w: number, h: number, image?: string, slide?: Slide) => ReactNode;
  head: { weight: number; upper?: boolean; tracking: string; leading: number; font?: string };
  bodyFont?: string;
  kicker: 'plain' | 'chip' | 'prompt' | 'box';
}

const light = (b: Brand): Theme => ({
  bg: b.ground,
  fg: b.text,
  muted: mix(b.text, b.ground, 0.4),
  accent: b.accent,
  accentInk: readableOn(b.accent),
  panel: mix(b.ground, b.text, 0.06),
  line: mix(b.ground, b.text, 0.16),
});

const dark = (b: Brand, bg: string, fg: string): Theme => ({
  bg,
  fg,
  muted: alpha(fg, 0.55),
  accent: onDark(b.accent),
  accentInk: readableOn(onDark(b.accent)),
  panel: alpha(fg, 0.06),
  line: alpha(fg, 0.16),
});

export const STYLES: StyleDef[] = [
  {
    id: 'glow',
    name: 'Soft Glow',
    blurb: 'Warm, calm, editorial',
    theme: light,
    background: (t, w, h) => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(ellipse ${w * 0.7}px ${h * 0.45}px at 100% 0%, ${alpha(t.accent, 0.28)}, transparent 70%), radial-gradient(ellipse ${w * 0.5}px ${h * 0.35}px at 0% 100%, ${alpha(t.accent, 0.14)}, transparent 70%)`,
        }}
      />
    ),
    head: { weight: 700, tracking: '-0.035em', leading: 1.02 },
    kicker: 'plain',
  },
  {
    id: 'brutal',
    name: 'Brutal Block',
    blurb: 'Loud accent, heavy caps',
    theme: (b) => ({
      bg: b.accent,
      fg: readableOn(b.accent),
      muted: alpha(readableOn(b.accent), 0.65),
      accent: readableOn(b.accent),
      accentInk: b.accent,
      panel: alpha(readableOn(b.accent), 0.1),
      line: alpha(readableOn(b.accent), 0.35),
    }),
    background: (t, w, h) => (
      <div
        style={{
          position: 'absolute',
          inset: 36,
          border: `6px solid ${t.fg}`,
          borderRadius: 4,
          pointerEvents: 'none',
          boxShadow: `${Math.round(w / 60)}px ${Math.round(w / 60)}px 0 ${alpha(t.fg, 0.9)}`,
          opacity: h > 0 ? 0.9 : 1,
        }}
      />
    ),
    head: { weight: 900, upper: true, tracking: '-0.03em', leading: 0.96 },
    kicker: 'chip',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    blurb: 'Dark grid, technical',
    theme: (b) => dark(b, '#0b0c10', '#f4f1ea'),
    background: (t) => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${t.line} 1px, transparent 1px), linear-gradient(90deg, ${t.line} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
          opacity: 0.5,
        }}
      />
    ),
    head: { weight: 700, tracking: '-0.03em', leading: 1.02 },
    kicker: 'box',
  },
  {
    id: 'editorial',
    name: 'Editorial',
    blurb: 'Serif headlines, thin rules',
    theme: light,
    background: (t, w) => (
      <>
        <div style={{ position: 'absolute', left: 96, right: 96, top: 150, height: 2, background: t.fg, opacity: 0.85 }} />
        <div style={{ position: 'absolute', left: 96, right: 96, bottom: 150, height: 1, background: t.line, width: w - 192 }} />
      </>
    ),
    head: { weight: 400, tracking: '-0.025em', leading: 1.0, font: 'Instrument Serif' },
    kicker: 'plain',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    blurb: 'Mono, dark, dev-flavoured',
    theme: (b) => dark(b, '#0a0c0b', '#e3f3e8'),
    background: (t) => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(0deg, ${alpha(t.fg, 0.03)} 0 2px, transparent 2px 6px)`,
        }}
      />
    ),
    head: { weight: 700, tracking: '-0.04em', leading: 1.05, font: 'JetBrains Mono' },
    bodyFont: 'JetBrains Mono',
    kicker: 'prompt',
  },
  {
    id: 'sticker',
    name: 'Sticker Pop',
    blurb: 'Playful, dotted, loud',
    theme: light,
    background: (t) => (
      <>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(t.fg, 0.1)} 3px, transparent 3px)`,
            backgroundSize: '44px 44px',
          }}
        />
        <div style={{ position: 'absolute', right: -120, top: -120, width: 420, height: 420, borderRadius: '50%', background: t.accent, opacity: 0.9 }} />
      </>
    ),
    head: { weight: 900, tracking: '-0.04em', leading: 0.98 },
    kicker: 'chip',
  },
  {
    id: 'photo',
    name: 'Photo Quote',
    blurb: 'Your photo, big white type',
    theme: (b) => ({
      bg: '#111111',
      fg: '#ffffff',
      muted: 'rgba(255,255,255,0.72)',
      accent: onDark(b.accent),
      accentInk: readableOn(onDark(b.accent)),
      panel: 'rgba(255,255,255,0.12)',
      line: 'rgba(255,255,255,0.3)',
    }),
    background: (t, w, h, image) => (
      <>
        {image ? (
          <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${alpha(t.accent, 0.55)}, #1a1420 70%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 35%, rgba(0,0,0,0.78) 100%)`, opacity: h > 0 && w > 0 ? 1 : 0 }} />
      </>
    ),
    head: { weight: 600, tracking: '-0.03em', leading: 1.04 },
    kicker: 'plain',
  },
  {
    id: 'graph',
    name: 'Graph Paper',
    blurb: 'Gridded, tidy, explanatory',
    theme: (b) => ({ ...light(b), bg: mix(b.ground, b.text, 0.05) }),
    background: (t) => (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(${alpha(t.fg, 0.07)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(t.fg, 0.07)} 2px, transparent 2px), linear-gradient(${alpha(t.fg, 0.13)} 2px, transparent 2px), linear-gradient(90deg, ${alpha(t.fg, 0.13)} 2px, transparent 2px)`,
          backgroundSize: '54px 54px, 54px 54px, 270px 270px, 270px 270px',
        }}
      />
    ),
    head: { weight: 800, tracking: '-0.04em', leading: 1.0 },
    kicker: 'box',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    blurb: 'Ruled paper, handwritten',
    theme: (b) => ({ ...light(b), bg: mix(b.ground, '#ffffff', 0.45) }),
    background: (t) => (
      <>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(180deg, transparent 0 62px, ${alpha('#4a7bd0', 0.28)} 62px 64px)`, backgroundPosition: '0 30px' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 70, width: 3, background: alpha('#d8453b', 0.55) }} />
      </>
    ),
    head: { weight: 700, tracking: '-0.01em', leading: 1.08, font: 'Caveat' },
    bodyFont: 'Caveat',
    kicker: 'plain',
  },
];

export const getStyle = (id: string): StyleDef => STYLES.find((s) => s.id === id) ?? STYLES[0];
