import { useState } from 'react';
import { BODY_FONTS, Brand, Doc, FORMATS, Format, HEAD_FONTS, Plan, SIGNATURES, SLIDE_KINDS, Slide, SlideKind, VOICES } from './types';
import { BRAND_PRESETS, brandDocument } from './brand';
import { STYLES } from './styles';
import { Scaled, SlideView } from './SlideView';
import { RewriteMode, rewrite, writeDeck } from './ai';
import { getStyle } from './styles';
import { TEMPLATES, Template } from './templates';
import { loadImage } from './image';

interface WriteProps {
  doc: Doc;
  brand: Brand;
  plan: Plan;
  active: number;
  setActive: (i: number) => void;
  patchDoc: (p: Partial<Doc>) => void;
  patchSlide: (i: number, p: Partial<Slide>) => void;
  setSlides: (s: Slide[]) => void;
  toast: (m: string) => void;
  onGate: (why: string) => void;
}

export function WritePanel({ doc, brand, plan, active, setActive, patchDoc, patchSlide, setSlides, toast, onGate }: WriteProps) {
  const [topic, setTopic] = useState('');
  const [busy, setBusy] = useState(false);
  const slide = doc.slides[active] ?? doc.slides[0];

  const generate = async () => {
    if (!topic.trim()) return toast('Type a topic first, e.g. “personal branding”.');
    setBusy(true);
    const r = await writeDeck(topic, brand, doc.format, plan);
    setSlides(r.slides);
    setActive(0);
    setBusy(false);
    toast(r.source === 'ai' ? 'Written in your voice.' : 'Offline starter copy — AI writing switches on once the server key is set.');
  };

  const tone = async (mode: RewriteMode) => {
    if (plan === 'free' && mode !== 'shorter') return onGate('Rewrite any slide in your tone with AI');
    const next = await rewrite(slide.body ?? slide.title, mode, brand, plan);
    if (next == null) return toast('Tone rewrites need the AI server. Shorter works offline.');
    patchSlide(active, slide.body ? { body: next } : { title: next });
  };

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= doc.slides.length) return;
    const s = [...doc.slides];
    [s[i], s[j]] = [s[j], s[i]];
    setSlides(s);
    setActive(j);
  };

  return (
    <div className="panel-body">
      <label className="field">
        <span>Format</span>
        <div className="chips">
          {(Object.keys(FORMATS) as Format[]).map((f) => (
            <button key={f} className={'chip' + (doc.format === f ? ' on' : '')} onClick={() => patchDoc({ format: f })}>
              {FORMATS[f].label}
            </button>
          ))}
        </div>
        <small>{FORMATS[doc.format].hint}</small>
      </label>

      <div className="field">
        <span>What is it about?</span>
        <div className="row">
          <input value={topic} placeholder="e.g. personal branding for coaches" onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && generate()} />
          <button className="btn primary" onClick={generate} disabled={busy}>{busy ? 'Writing…' : 'Write it'}</button>
        </div>
        <small>Voice: {brand.voice}. Change it in the Brand tab.</small>
      </div>

      <div className="field">
        <span>Slides</span>
        <div className="slide-list">
          {doc.slides.map((s, i) => (
            <button key={i} className={'slide-row' + (i === active ? ' on' : '')} onClick={() => setActive(i)}>
              <b>{String(i + 1).padStart(2, '0')}</b>
              <span>{s.title.replace(/\*/g, '')}</span>
            </button>
          ))}
        </div>
        <div className="row wrap">
          <button className="btn sm" onClick={() => { setSlides([...doc.slides, { kind: 'point', title: 'New *idea*', body: 'Say it in one sentence.' }]); setActive(doc.slides.length); }}>+ Slide</button>
          <button className="btn sm" onClick={() => move(active, -1)} aria-label="Move up">↑</button>
          <button className="btn sm" onClick={() => move(active, 1)} aria-label="Move down">↓</button>
          <button className="btn sm" disabled={doc.slides.length < 2} onClick={() => { setSlides(doc.slides.filter((_, i) => i !== active)); setActive(Math.max(0, active - 1)); }}>Delete</button>
        </div>
      </div>

      {slide ? (
        <div className="editor-card">
          <div className="row">
            <select value={slide.kind} onChange={(e) => patchSlide(active, { kind: e.target.value as SlideKind })} aria-label="Slide layout">
              {SLIDE_KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </div>
          <label className="field"><span>Headline</span>
            <textarea rows={2} value={slide.title} onChange={(e) => patchSlide(active, { title: e.target.value })} />
            <small>Wrap one word in *stars* to apply your signature.</small>
          </label>
          {slide.kind !== 'list' && slide.kind !== 'steps' && slide.kind !== 'compare' && slide.kind !== 'chart' ? (
            <label className="field"><span>{slide.kind === 'quote' ? 'Who said it' : 'Supporting line'}</span>
              <textarea rows={2} value={slide.body ?? ''} onChange={(e) => patchSlide(active, { body: e.target.value })} />
            </label>
          ) : (
            <label className="field"><span>{slide.kind === 'steps' ? 'Steps (one per line, max 5)' : slide.kind === 'compare' ? 'Rows: first line is the headings' : slide.kind === 'chart' ? 'Bars: Label: number' : 'Items (one per line, max 6)'}</span>
              <textarea rows={5} value={(slide.items ?? []).join('\n')} onChange={(e) => patchSlide(active, { items: e.target.value.split('\n') })} />
              {slide.kind === 'compare' ? <small>Separate the two sides with ||, e.g. “By hand || With a system”.</small> : null}
              {slide.kind === 'chart' ? <small>One bar per line, e.g. “Reach: 82”. The biggest bar is highlighted.</small> : null}
            </label>
          )}
          {slide.kind === 'stat' ? (
            <div className="row">
              <input aria-label="Stat value" value={slide.stat?.value ?? ''} placeholder="10×" onChange={(e) => patchSlide(active, { stat: { value: e.target.value, label: slide.stat?.label ?? '' } })} />
              <input aria-label="Stat label" value={slide.stat?.label ?? ''} placeholder="faster" onChange={(e) => patchSlide(active, { stat: { value: slide.stat?.value ?? '', label: e.target.value } })} />
            </div>
          ) : null}
          {slide.kind === 'cta' ? (
            <label className="field"><span>Button text</span>
              <input value={slide.items?.[0] ?? ''} onChange={(e) => patchSlide(active, { items: [e.target.value] })} />
            </label>
          ) : null}
          {doc.styleId === 'photo' ? (
            <div className="field"><span>Photo for this slide</span>
              <div className="row">
                <label className="btn sm file">{slide.image ? 'Replace' : 'Upload'}
                  <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { patchSlide(active, { image: await loadImage(f) }); } catch (err) { toast((err as Error).message); } } e.target.value = ''; }} />
                </label>
                {slide.image ? <button className="btn sm" onClick={() => patchSlide(active, { image: undefined })}>Use deck photo</button> : null}
              </div>
            </div>
          ) : null}
          <div className="field"><span>Tone {plan === 'free' ? '· Pro' : ''}</span>
            <div className="chips">
              {(['shorter', 'bolder', 'calmer', 'warmer'] as RewriteMode[]).map((m) => (
                <button key={m} className="chip" onClick={() => tone(m)}>{m}</button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface StyleProps { doc: Doc; brand: Brand; patchDoc: (p: Partial<Doc>) => void }

export function StylePanel({ doc, brand, patchDoc }: StyleProps) {
  const sample = doc.slides[0];
  const f = FORMATS[doc.format];
  return (
    <div className="panel-body">
      <p className="hint">Every style uses your colours, fonts and signature. Tap one to restyle the whole {FORMATS[doc.format].label.toLowerCase()}.</p>
      {doc.styleId === 'photo' ? (
        <div className="field"><span>Background photo</span>
          <div className="row">
            <label className="btn sm file">{doc.image ? 'Replace photo' : 'Upload photo'}
              <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { patchDoc({ image: await loadImage(f) }); } catch (err) { alert((err as Error).message); } } e.target.value = ''; }} />
            </label>
            {doc.image ? <button className="btn sm" onClick={() => patchDoc({ image: undefined })}>Remove</button> : null}
          </div>
          <small>Used on every slide. Portrait photos with a calm area for text work best.</small>
        </div>
      ) : null}
      <div className="style-grid">
        {STYLES.map((s) => (
          <button key={s.id} className={'style-card' + (doc.styleId === s.id ? ' on' : '')} onClick={() => patchDoc({ styleId: s.id })}>
            <Scaled w={f.w} h={f.h}>
              <SlideView slide={sample} brand={brand} style={getStyle(s.id)} index={0} total={doc.slides.length} w={f.w} h={f.h} format={doc.format} watermark={false} docImage={doc.image} />
            </Scaled>
            <b>{s.name}</b>
            <small>{s.blurb}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

interface BrandProps {
  brands: Brand[];
  brand: Brand;
  plan: Plan;
  maxBrands: number;
  patch: (p: Partial<Brand>) => void;
  select: (id: string) => void;
  add: () => void;
  toast: (m: string) => void;
}

export function BrandPanel({ brands, brand, patch, select, add, toast }: BrandProps) {
  const [customVoice, setCustomVoice] = useState('');
  const body = BODY_FONTS.includes(brand.bodyFont) ? brand.bodyFont : '';
  return (
    <div className="panel-body">
      <div className="field"><span>Brand</span>
        <div className="row">
          <select value={brand.id} onChange={(e) => select(e.target.value)}>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="btn sm" onClick={add}>+ Brand</button>
        </div>
      </div>
      <div className="row">
        <label className="field grow"><span>Name</span><input value={brand.name} onChange={(e) => patch({ name: e.target.value })} /></label>
        <label className="field grow"><span>Handle</span><input value={brand.handle} onChange={(e) => patch({ handle: e.target.value })} /></label>
      </div>

      <div className="field"><span>Logo</span>
        <div className="row">
          <label className="btn sm file">{brand.logo ? 'Replace logo' : 'Upload logo'}
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { patch({ logo: await loadImage(f, 480) }); } catch (err) { toast((err as Error).message); } } e.target.value = ''; }} />
          </label>
          {brand.logo ? <><img src={brand.logo} alt="" style={{ height: 32, maxWidth: 90, objectFit: 'contain' }} /><button className="btn sm" onClick={() => patch({ logo: undefined })}>Remove</button></> : null}
        </div>
        <small>Shows in the footer of every slide.</small>
      </div>

      <div className="field"><span>Start from a palette</span>
        <div className="chips">
          {BRAND_PRESETS.map((p) => (
            <button key={p.name} className="chip swatch" onClick={() => patch({ accent: p.accent, ground: p.ground, text: p.text, headFont: p.headFont })}>
              <i style={{ background: p.accent }} /><i style={{ background: p.ground, boxShadow: 'inset 0 0 0 1px #0002' }} /><i style={{ background: p.text }} />{p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="colors">
        {([['accent', 'Accent'], ['ground', 'Ground'], ['text', 'Text']] as const).map(([k, label]) => (
          <label key={k} className="color"><span>{label}</span>
            <input type="color" value={brand[k]} onChange={(e) => patch({ [k]: e.target.value })} />
            <code>{brand[k]}</code>
          </label>
        ))}
      </div>

      <label className="field"><span>Headline font</span>
        <select value={brand.headFont} onChange={(e) => patch({ headFont: e.target.value })} style={{ fontFamily: `'${brand.headFont}'` }}>
          {HEAD_FONTS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </label>

      <div className="field"><span>Your signature</span>
        <small>The one detail that makes a slide look like yours.</small>
        <div className="sig-grid">
          {SIGNATURES.map((s) => (
            <button key={s.id} className={'sig' + (brand.signature === s.id ? ' on' : '')} onClick={() => patch({ signature: s.id })}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <label className="field"><span>Body font</span>
        <select value={body} onChange={(e) => patch({ bodyFont: e.target.value || brand.bodyFont })}>
          {BODY_FONTS.map((f) => <option key={f}>{f}</option>)}
          {!body ? <option value="">{brand.bodyFont}</option> : null}
        </select>
        <input placeholder="…or type any Google font" onBlur={(e) => e.target.value.trim() && patch({ bodyFont: e.target.value.trim() })} />
      </label>

      <div className="field"><span>Your voice</span>
        <div className="chips">
          {VOICES.map((v) => (
            <button key={v.id} className={'chip' + (brand.voice === v.label ? ' on' : '')} onClick={() => patch({ voice: v.label })}>{v.label}</button>
          ))}
        </div>
        <input value={customVoice} placeholder="…or three words of your own" onChange={(e) => setCustomVoice(e.target.value)} onBlur={() => customVoice.trim() && patch({ voice: customVoice.trim() })} />
      </div>

      <div className="doc-card">
        <header>Your brand document · live</header>
        <pre>{brandDocument(brand)}</pre>
        <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(brandDocument(brand)); toast('Brand document copied.'); }}>Copy</button>
      </div>
    </div>
  );
}

interface TemplatesProps { brand: Brand; doc: Doc; open: (t: Template, topic: string) => void; hasWork: boolean }

export function TemplatesPanel({ brand, doc, open, hasWork }: TemplatesProps) {
  const [topic, setTopic] = useState('');
  const cats = ['Carousels', 'Single posts', 'Decks'] as const;
  return (
    <div className="panel-body">
      <label className="field"><span>Your topic (optional)</span>
        <input value={topic} placeholder="e.g. personal branding" onChange={(e) => setTopic(e.target.value)} />
        <small>Templates start with your topic and your brand. {hasWork ? 'Opening one replaces the current slides.' : ''}</small>
      </label>
      {cats.map((c) => (
        <div key={c} className="field"><span>{c}</span>
          <div className="tpl-row">
            {TEMPLATES.filter((t) => t.category === c).map((t) => {
              const f = FORMATS[t.format];
              const slides = t.build(topic, brand);
              return (
                <button key={t.id} className="tpl" onClick={() => open(t, topic)}>
                  <div className="tpl-thumb" style={{ aspectRatio: `${f.w} / ${f.h}` }}>
                    <Scaled w={f.w} h={f.h}>
                      <SlideView slide={slides[0]} brand={brand} style={getStyle(t.styleId)} index={0} total={slides.length} w={f.w} h={f.h} format={t.format} watermark={false} docImage={doc.image} />
                    </Scaled>
                    {t.isNew ? <i className="new">New</i> : null}
                    <i className="count">{slides.length} {slides.length === 1 ? 'slide' : 'slides'}</i>
                  </div>
                  <b>{t.name}</b>
                  <small>{t.blurb}</small>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
