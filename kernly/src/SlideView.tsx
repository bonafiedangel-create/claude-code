import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Brand, Format, Slide } from './types';
import { MONO, fontStack, resolveBody } from './brand';
import { alpha } from './color';
import { StyleDef, Theme } from './styles';
import { APP } from './config';

interface Props {
  slide: Slide;
  brand: Brand;
  style: StyleDef;
  index: number;
  total: number;
  w: number;
  h: number;
  format: Format;
  watermark: boolean;
  docImage?: string;
}

const PAD = 96;

function Key({ children, brand, t }: { children: ReactNode; brand: Brand; t: Theme }) {
  switch (brand.signature) {
    case 'italic':
      return (
        <em style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '1.1em', color: t.accent === t.fg ? undefined : t.accent }}>
          {children}
        </em>
      );
    case 'highlight':
      return (
        <span style={{ background: t.accent, color: t.accentInk, padding: '0 0.14em', borderRadius: '0.08em', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}>
          {children}
        </span>
      );
    case 'sticker':
      return (
        <span style={{ display: 'inline-block', background: '#fffdf8', color: '#15121a', padding: '0.02em 0.22em', transform: 'rotate(-3deg)', boxShadow: '0 0.06em 0.2em rgba(0,0,0,0.28)', fontWeight: 800 }}>
          {children}
        </span>
      );
    default:
      return <span style={{ color: t.accent }}>{children}</span>;
  }
}

function Headline({ text, size, brand, t, st, serifBoost }: { text: string; size: number; brand: Brand; t: Theme; st: StyleDef; serifBoost?: boolean }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  const font = st.head.font ?? brand.headFont;
  const css: CSSProperties = {
    margin: 0,
    fontFamily: fontStack(font),
    fontWeight: st.head.weight,
    fontSize: size * (serifBoost ? (st.head.font === 'Instrument Serif' ? 1.12 : st.head.font === 'Caveat' ? 1.3 : 1) : 1),
    lineHeight: st.head.leading,
    letterSpacing: st.head.tracking,
    textTransform: st.head.upper ? 'uppercase' : 'none',
    color: t.fg,
    textWrap: 'balance' as CSSProperties['textWrap'],
  };
  return (
    <h1 style={css}>
      {parts.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') ? (
          <Key key={i} brand={brand} t={t}>
            {p.slice(1, -1)}
          </Key>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </h1>
  );
}

const fit = (text: string, big: number, small: number, limit = 40) => {
  const len = text.replace(/\*/g, '').length;
  return Math.max(small, Math.min(big, big - (len - limit) * (big - small) / 60));
};

function Stairs({ items, t, w, h }: { items: string[]; t: Theme; w: number; h: number }) {
  const list = items.slice(0, 5);
  const n = Math.max(list.length, 1);
  const sw = w / n;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      {list.map((label, i) => {
        const sh = ((i + 1) / n) * (h - 90);
        const x = i * sw;
        const y = h - 40 - sh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={sw} height={sh} fill={t.panel} />
            <path d={`M${x} ${h - 40}V${y}H${x + sw}`} fill="none" stroke={i === n - 1 ? t.accent : t.fg} strokeWidth={i === n - 1 ? 9 : 5} strokeLinejoin="round" />
            <text x={x + 18} y={y - 22} fontFamily={MONO} fontSize={26} fontWeight={700} letterSpacing={2} fill={i === n - 1 ? t.accent : t.fg}>
              {label.toUpperCase()}
            </text>
            <text x={x + 18} y={h - 8} fontFamily={MONO} fontSize={22} fill={t.muted}>
              {String(i + 1).padStart(2, '0')}
            </text>
          </g>
        );
      })}
      <line x1={0} y1={h - 40} x2={w} y2={h - 40} stroke={t.muted} strokeWidth={3} />
    </svg>
  );
}

function Curve({ t, w, h }: { t: Theme; w: number; h: number }) {
  const pts: string[] = [];
  const base: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const x = (i / 40) * w;
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(h - 30 - Math.pow(i / 40, 2.6) * (h - 70)).toFixed(1)}`);
    base.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${(h - 30 - (i / 40) * (h - 70) * 0.28).toFixed(1)}`);
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', overflow: 'visible' }}>
      <path d={`${pts.join('')}L${w} ${h - 30}L0 ${h - 30}Z`} fill={t.accent} opacity={0.14} />
      <path d={base.join('')} fill="none" stroke={t.muted} strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
      <path d={pts.join('')} fill="none" stroke={t.accent} strokeWidth={9} strokeLinecap="round" />
      <line x1={0} y1={h - 30} x2={w} y2={h - 30} stroke={t.muted} strokeWidth={3} />
    </svg>
  );
}

export function SlideView({ slide, brand, style: st, index, total, w, h, format, watermark, docImage }: Props) {
  const t = st.theme(brand);
  const bodyFont = st.bodyFont ?? resolveBody(brand);
  const bodyScale = bodyFont === 'Caveat' ? 1.25 : 1;
  const image = slide.image ?? docImage;
  const isDeck = format === 'deck';
  const padX = isDeck ? 140 : PAD;
  const contentW = w - padX * 2;
  const last = index === total - 1;
  const kickerText = (slide.kicker ?? (slide.kind === 'cover' ? brand.name : String(index + 1).padStart(2, '0'))).toUpperCase();

  const kickerEl = (() => {
    const base: CSSProperties = { fontFamily: MONO, fontSize: 26, letterSpacing: '0.18em', fontWeight: 500, color: t.muted };
    if (brand.signature === 'label' || st.kicker === 'chip') {
      const pillBg = st.id === 'brutal' ? t.fg : '#15121a';
      const pillFg = st.id === 'brutal' ? t.accentInk : '#fffaf2';
      return (
        <span style={{ ...base, display: 'inline-flex', alignItems: 'center', gap: 14, background: pillBg, color: pillFg, padding: '12px 24px', borderRadius: 999 }}>
          <i style={{ width: 14, height: 14, borderRadius: '50%', background: st.id === 'brutal' ? t.accentInk : t.accent, boxShadow: `0 0 14px ${t.accent}` }} />
          {kickerText}
        </span>
      );
    }
    if (st.kicker === 'prompt') return <span style={{ ...base, color: t.accent }}>{'> '}{kickerText}</span>;
    if (st.kicker === 'box') return <span style={{ ...base, border: `2px solid ${t.line}`, padding: '10px 20px', color: t.fg }}>{kickerText}</span>;
    return <span style={base}>{kickerText}</span>;
  })();

  const body = slide.body ? (
    <p style={{ margin: 0, fontFamily: fontStack(bodyFont), fontSize: (isDeck ? 40 : 42) * bodyScale, lineHeight: 1.35, color: t.muted === t.fg ? t.fg : t.fg, opacity: 0.78, maxWidth: isDeck ? 1100 : '100%', textWrap: 'pretty' as CSSProperties['textWrap'] }}>
      {slide.body}
    </p>
  ) : null;

  const bar = brand.signature === 'bar' ? <div style={{ width: 130, height: 14, background: t.accent, marginBottom: 44 }} /> : null;
  const gap = 40;

  let main: ReactNode;
  switch (slide.kind) {
    case 'cover':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? fit(slide.title, 150, 100, 28) : fit(slide.title, 128, 84, 30)} brand={brand} t={t} st={st} serifBoost />
          {body}
        </div>
      );
      break;
    case 'point':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? fit(slide.title, 120, 80, 30) : fit(slide.title, 96, 66, 34)} brand={brand} t={t} st={st} serifBoost />
          {body}
        </div>
      );
      break;
    case 'list':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? 92 : 78} brand={brand} t={t} st={st} serifBoost />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {(slide.items ?? []).slice(0, 6).map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'baseline', padding: '22px 0', borderTop: `2px solid ${t.line}` }}>
                <span style={{ fontFamily: MONO, fontSize: 26, color: t.accent, fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ fontFamily: fontStack(bodyFont), fontSize: (isDeck ? 42 : 44) * bodyScale, color: t.fg, lineHeight: 1.2 }}>{it}</span>
              </div>
            ))}
          </div>
        </div>
      );
      break;
    case 'steps':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-between', flex: 1, paddingTop: 36 }}>
          <div>
            {bar}
            <Headline text={slide.title} size={isDeck ? 96 : 80} brand={brand} t={t} st={st} serifBoost />
          </div>
          <Stairs items={slide.items ?? []} t={t} w={contentW} h={isDeck ? 400 : 500} />
        </div>
      );
      break;
    case 'stat':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, justifyContent: 'space-between', flex: 1, paddingTop: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Headline text={slide.title} size={isDeck ? 80 : 68} brand={brand} t={t} st={st} serifBoost />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: fontStack(st.head.font ?? brand.headFont), fontWeight: st.head.weight, fontSize: isDeck ? 240 : 250, lineHeight: 0.9, letterSpacing: '-0.05em', color: t.accent }}>
                {slide.stat?.value ?? '10×'}
              </span>
              <span style={{ fontFamily: MONO, fontSize: 30, letterSpacing: '0.12em', color: t.fg, textTransform: 'uppercase', maxWidth: 520 }}>{slide.stat?.label ?? ''}</span>
            </div>
            {body}
          </div>
          <Curve t={t} w={contentW} h={isDeck ? 300 : 380} />
        </div>
      );
      break;
    case 'quote':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center', flex: 1 }}>
          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 260, lineHeight: 0.6, color: t.accent, height: 120 }}>“</span>
          <Headline text={slide.title} size={isDeck ? 96 : 74} brand={brand} t={t} st={st} serifBoost />
          {slide.body ? <span style={{ fontFamily: MONO, fontSize: 28, letterSpacing: '0.12em', color: t.muted, textTransform: 'uppercase' }}>{slide.body}</span> : null}
        </div>
      );
      break;
    case 'compare': {
      const rows = (slide.items ?? []).map((r) => r.split('||').map((c) => c.trim()));
      const head = rows[0] ?? ['Before', 'After'];
      const data = rows.slice(1, 6);
      const col = (side: 0 | 1): CSSProperties => ({
        flex: 1,
        borderRadius: st.id === 'blueprint' || st.id === 'terminal' ? 6 : 24,
        padding: '34px 34px',
        background: side === 1 ? t.accent : t.panel,
        color: side === 1 ? t.accentInk : t.fg,
        border: side === 0 ? `2px solid ${t.line}` : 'none',
      });
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? 88 : 72} brand={brand} t={t} st={st} serifBoost />
          <div style={{ display: 'flex', gap: 22 }}>
            {[0, 1].map((side) => (
              <div key={side} style={col(side as 0 | 1)}>
                <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8, marginBottom: 22 }}>{head[side] ?? ''}</div>
                {data.map((r, i) => (
                  <div key={i} style={{ fontFamily: fontStack(bodyFont), fontSize: (isDeck ? 36 : 38) * bodyScale, lineHeight: 1.25, padding: '16px 0', borderTop: `2px solid ${side === 1 ? alpha(t.accentInk, 0.3) : t.line}` }}>
                    {r[side] ?? ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
      break;
    }
    case 'chart': {
      const bars = (slide.items ?? [])
        .map((r) => {
          const i = r.lastIndexOf(':');
          return i < 0 ? null : { label: r.slice(0, i).trim(), value: parseFloat(r.slice(i + 1)) };
        })
        .filter((b): b is { label: string; value: number } => !!b && Number.isFinite(b.value))
        .slice(0, 6);
      const max = Math.max(...bars.map((b) => b.value), 1);
      const top = bars.reduce((m, b) => (b.value > m ? b.value : m), -Infinity);
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? 84 : 70} brand={brand} t={t} st={st} serifBoost />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {bars.map((b, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 26, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                  <span>{b.label}</span>
                  <b style={{ color: b.value === top ? t.accent : t.fg }}>{b.value}</b>
                </div>
                <div style={{ height: 40, background: t.panel, borderRadius: st.id === 'blueprint' || st.id === 'terminal' ? 2 : 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.max(2, (b.value / max) * 100)}%`, height: '100%', background: b.value === top ? t.accent : alpha(t.fg, 0.55), borderRadius: 'inherit' }} />
                </div>
              </div>
            ))}
          </div>
          {body}
        </div>
      );
      break;
    }
    case 'cta':
      main = (
        <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center', flex: 1 }}>
          {bar}
          <Headline text={slide.title} size={isDeck ? fit(slide.title, 150, 100, 20) : fit(slide.title, 120, 80, 22)} brand={brand} t={t} st={st} serifBoost />
          {body}
          <div style={{ alignSelf: 'flex-start', background: t.accent, color: t.accentInk, fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: '0.06em', padding: '26px 48px', borderRadius: st.id === 'blueprint' || st.id === 'terminal' ? 6 : 999, textTransform: 'uppercase' }}>
            {slide.items?.[0] ?? `Follow ${brand.handle}`} →
          </div>
        </div>
      );
      break;
  }

  const meta: CSSProperties = { fontFamily: MONO, fontSize: 24, letterSpacing: '0.16em', color: t.muted, textTransform: 'uppercase' };
  const counter = format === 'post' ? null : `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: t.bg, color: t.fg, fontFamily: fontStack(bodyFont) }}>
      {st.background(t, w, h, image, slide)}
      <div style={{ position: 'absolute', inset: 0, padding: `${PAD * 0.8}px ${padX}px ${PAD * 1.1}px`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 56 }}>
          {kickerEl}
          {counter ? <span style={meta}>{counter}</span> : null}
        </div>
        {main}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...meta }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            {brand.logo ? <img src={brand.logo} alt="" style={{ height: 44, maxWidth: 160, objectFit: 'contain' }} /> : null}
            {brand.handle}
          </span>
          <span>{format === 'carousel' && !last ? 'Swipe →' : brand.name}</span>
        </div>
      </div>
      {watermark ? (
        <div style={{ position: 'absolute', left: '50%', bottom: 30, transform: 'translateX(-50%)', fontFamily: MONO, fontSize: 22, letterSpacing: '0.14em', color: '#fffaf2', background: 'rgba(21,18,26,0.82)', padding: '10px 22px', borderRadius: 999, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          Made with {APP.name} · free preview
        </div>
      ) : null}
    </div>
  );
}

/** Fits a fixed-size slide into whatever width its container gives it. */
export function Scaled({ w, h, maxWidth, children }: { w: number; h: number; maxWidth?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.3);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setS(el.clientWidth / w || 0.3);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} style={{ width: '100%', maxWidth, aspectRatio: `${w} / ${h}`, position: 'relative', overflow: 'hidden', margin: '0 auto' }}>
      <div style={{ width: w, height: h, transform: `scale(${s})`, transformOrigin: 'top left', position: 'absolute', left: 0, top: 0 }}>{children}</div>
    </div>
  );
}
