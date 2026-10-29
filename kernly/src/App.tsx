import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Brand, Doc, FORMATS, PLANS, Plan, Slide } from './types';
import { DEFAULT_BRAND } from './brand';
import { EXAMPLES } from './examples';
import { getStyle } from './styles';
import { Scaled, SlideView } from './SlideView';
import { BrandPanel, StylePanel, TemplatesPanel, WritePanel } from './Panels';
import { Template, buildDoc } from './templates';
import { Paywall } from './Paywall';
import { Wordmark } from './Logo';
import { exportAll, exportPng } from './export';
import { loadBrands, loadDocs, loadPlan, saveBrands, saveDocs, savePlan } from './store';

type Tab = 'templates' | 'write' | 'style' | 'brand';
const uid = () => Math.random().toString(36).slice(2, 10);

export function App() {
  const [plan, setPlan] = useState<Plan>(loadPlan);
  const [brands, setBrands] = useState<Brand[]>(() => (loadPlan() === 'free' ? [DEFAULT_BRAND] : loadBrands()));
  const [saved, setSaved] = useState<Doc[]>(() => (loadPlan() === 'free' ? [] : loadDocs()));
  const [doc, setDoc] = useState<Doc>(() => structuredClone(EXAMPLES[0]));
  const [active, setActive] = useState(0);
  const [tab, setTab] = useState<Tab>('templates');
  const [note, setNote] = useState('');
  const [gate, setGate] = useState<string | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutErr, setCheckoutErr] = useState('');
  const [exporting, setExporting] = useState<null | 'png' | 'zip' | 'pdf'>(null);
  const [showWork, setShowWork] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const noteTimer = useRef<number>(0);

  const brand = brands.find((b) => b.id === doc.brandId) ?? brands[0];
  const style = getStyle(doc.styleId);
  const fmt = FORMATS[doc.format];
  const paid = plan !== 'free';
  const slide = doc.slides[Math.min(active, doc.slides.length - 1)];
  const maxBrands = PLANS[plan].brands;

  const toast = useCallback((m: string) => {
    setNote(m);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(''), 3800);
  }, []);

  // Return from Stripe Checkout: verify the session, then unlock.
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const sid = q.get('session_id');
    if (!q.get('paid') || !sid) return;
    history.replaceState({}, '', location.pathname);
    fetch(`/api/verify?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((d: { plan?: Plan }) => {
        if (d.plan && d.plan !== 'free') {
          savePlan(d.plan, sid);
          setPlan(d.plan);
          setBrands(loadBrands());
          toast(`Welcome to ${PLANS[d.plan].label}. Your work now saves.`);
        } else toast('Payment not confirmed yet — refresh in a moment.');
      })
      .catch(() => toast('Could not verify payment. Contact support with your receipt.'));
  }, [toast]);

  const requirePaid = useCallback((why: string) => {
    setCheckoutErr('');
    setGate(why);
  }, []);

  const patchDoc = (p: Partial<Doc>) => setDoc((d) => ({ ...d, ...p }));
  const setSlides = (slides: Slide[]) => setDoc((d) => ({ ...d, slides }));
  const patchSlide = (i: number, p: Partial<Slide>) =>
    setDoc((d) => ({ ...d, slides: d.slides.map((s, j) => (j === i ? { ...s, ...p } : s)) }));

  const patchBrand = (p: Partial<Brand>) => {
    const next = brands.map((b) => (b.id === brand.id ? { ...b, ...p } : b));
    setBrands(next);
    if (paid) saveBrands(next);
  };
  const addBrand = () => {
    if (brands.length >= maxBrands) return requirePaid(plan === 'free' ? 'Add more brands' : 'Unlimited client brands');
    const b: Brand = { ...DEFAULT_BRAND, id: uid(), name: `Brand ${brands.length + 1}` };
    const next = [...brands, b];
    setBrands(next);
    if (paid) saveBrands(next);
    patchDoc({ brandId: b.id });
  };

  const save = () => {
    if (!paid) return requirePaid('Save your work');
    const next = [{ ...doc, updatedAt: Date.now() }, ...saved.filter((d) => d.id !== doc.id)];
    setSaved(next);
    saveDocs(next);
    saveBrands(brands);
    toast('Saved to My work.');
  };

  const newDoc = () => {
    setDoc({ id: uid(), title: 'Untitled', format: 'carousel', styleId: doc.styleId, brandId: brand.id, slides: [{ kind: 'cover', title: 'Your first *headline*', body: 'Write a topic on the left and hit “Write it”.' }], updatedAt: Date.now() });
    setActive(0);
    setTab('write');
  };

  const openTemplate = (t: Template, topic: string) => {
    setDoc(buildDoc(t, topic, brand));
    setActive(0);
    setTab('write');
    toast(`${t.name} opened. Edit the text, restyle it, or change your brand.`);
  };

  const openExample = (ex: Doc) => {
    setDoc({ ...structuredClone(ex), brandId: brand.id });
    setActive(0);
  };

  const doExport = async (kind: 'png' | 'zip' | 'pdf') => {
    if (!paid && kind !== 'png') return requirePaid('Export every slide as PDF or ZIP');
    setExporting(kind);
  };

  // Offscreen full-size render, captured only while an export is running.
  useEffect(() => {
    if (!exporting || !exportRef.current) return;
    const root = exportRef.current;
    let cancelled = false;
    (async () => {
      try {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (exporting === 'png') await exportPng(root, active, fmt.w, fmt.h, doc.title);
        else await exportAll(root, doc.slides.length, fmt.w, fmt.h, doc.title, exporting);
        if (!cancelled) toast(paid ? 'Exported.' : 'Exported with the free-preview badge. Go Pro for clean files.');
      } catch (e) {
        console.error(e);
        if (!cancelled) toast('Export failed — check your connection (fonts load from Google) and try again.');
      } finally {
        if (!cancelled) setExporting(null);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exporting]);

  const checkout = async (p: 'pro' | 'studio', interval: 'month' | 'year') => {
    setCheckoutBusy(true);
    setCheckoutErr('');
    try {
      const r = await fetch('/api/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ plan: p, interval }) });
      const d = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !d.url) throw new Error(d.error || 'Checkout is not configured yet.');
      location.href = d.url;
    } catch (e) {
      setCheckoutErr((e as Error).message);
    } finally {
      setCheckoutBusy(false);
    }
  };

  const devUnlock = () => {
    savePlan('pro');
    setPlan('pro');
    setGate(null);
    toast('Pro unlocked (dev).');
  };

  const thumbs = useMemo(() => doc.slides, [doc.slides]);

  return (
    <div className="app">
      <header className="top">
        <Wordmark />
        <div className="top-actions">
          <button className="btn sm ghost" onClick={() => setShowWork(true)}>My work{paid && saved.length ? ` (${saved.length})` : ''}</button>
          <button className="btn sm" onClick={save}>Save{!paid ? ' · Pro' : ''}</button>
          {paid ? <span className="plan-pill">{PLANS[plan].label}</span> : <button className="btn sm primary" onClick={() => requirePaid('Keep your work and export it clean')}>Upgrade</button>}
        </div>
      </header>

      <div className="examples" role="group" aria-label="Examples">
        <span>Try an example</span>
        {EXAMPLES.map((ex) => (
          <button key={ex.id} className={'chip' + (doc.id === ex.id ? ' on' : '')} onClick={() => openExample(ex)}>{FORMATS[ex.format].label}</button>
        ))}
        <button className="chip" onClick={newDoc}>+ Blank</button>
      </div>

      <main className="layout">
        <section className="stage">
          <input className="title-input" value={doc.title} onChange={(e) => patchDoc({ title: e.target.value })} aria-label="Project title" />
          {slide ? (
            <Scaled w={fmt.w} h={fmt.h} maxWidth={`min(100%, calc(66vh * ${fmt.w / fmt.h}))`}>
              <SlideView slide={slide} brand={brand} style={style} index={Math.min(active, doc.slides.length - 1)} total={doc.slides.length} w={fmt.w} h={fmt.h} format={doc.format} watermark={!paid} docImage={doc.image} />
            </Scaled>
          ) : null}
          <div className="strip" role="tablist" aria-label="Slides">
            {thumbs.map((s, i) => (
              <button key={i} role="tab" aria-selected={i === active} className={'thumb' + (i === active ? ' on' : '')} style={{ width: doc.format === 'deck' ? 120 : 76 }} onClick={() => setActive(i)}>
                <Scaled w={fmt.w} h={fmt.h}>
                  <SlideView slide={s} brand={brand} style={style} index={i} total={thumbs.length} w={fmt.w} h={fmt.h} format={doc.format} watermark={false} docImage={doc.image} />
                </Scaled>
              </button>
            ))}
          </div>
          <div className="export-bar">
            <button className="btn" onClick={() => doExport('png')} disabled={!!exporting}>{exporting === 'png' ? 'Exporting…' : 'Download slide'}</button>
            <button className="btn" onClick={() => doExport('zip')} disabled={!!exporting}>ZIP{!paid ? ' · Pro' : ''}</button>
            <button className="btn" onClick={() => doExport('pdf')} disabled={!!exporting}>PDF{!paid ? ' · Pro' : ''}</button>
          </div>
        </section>

        <aside className="panel">
          <nav className="tabs" role="tablist">
            {(['templates', 'write', 'style', 'brand'] as Tab[]).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
                {t === 'templates' ? 'Templates' : t === 'write' ? 'Write' : t === 'style' ? 'Style' : 'Brand'}
              </button>
            ))}
          </nav>
          {tab === 'templates' ? (
            <TemplatesPanel brand={brand} doc={doc} open={openTemplate} hasWork={saved.every((d) => d.id !== doc.id) && !doc.id.startsWith('ex-')} />
          ) : tab === 'write' ? (
            <WritePanel doc={doc} brand={brand} plan={plan} active={Math.min(active, doc.slides.length - 1)} setActive={setActive} patchDoc={patchDoc} patchSlide={patchSlide} setSlides={setSlides} toast={toast} onGate={requirePaid} />
          ) : tab === 'style' ? (
            <StylePanel doc={doc} brand={brand} patchDoc={patchDoc} />
          ) : (
            <BrandPanel brands={brands} brand={brand} plan={plan} maxBrands={maxBrands} patch={patchBrand} select={(id) => patchDoc({ brandId: id })} add={addBrand} toast={toast} />
          )}
        </aside>
      </main>

      {exporting ? (
        <div ref={exportRef} className="offscreen" aria-hidden="true">
          {doc.slides.map((s, i) => (
            <div key={i} data-ex={i} style={{ width: fmt.w, height: fmt.h }}>
              <SlideView slide={s} brand={brand} style={style} index={i} total={doc.slides.length} w={fmt.w} h={fmt.h} format={doc.format} watermark={!paid} docImage={doc.image} />
            </div>
          ))}
        </div>
      ) : null}

      {gate ? <Paywall reason={gate} onClose={() => setGate(null)} onCheckout={checkout} busy={checkoutBusy} error={checkoutErr} onDevUnlock={import.meta.env.DEV ? devUnlock : undefined} /> : null}

      {showWork ? (
        <div className="modal-back" onClick={() => setShowWork(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setShowWork(false)} aria-label="Close">×</button>
            <p className="eyebrow">My work</p>
            {!paid ? (
              <>
                <h2>Free projects don’t save</h2>
                <p className="sub">You can build anything here and export one watermarked slide. Go Pro to keep every project.</p>
                <button className="btn primary" onClick={() => { setShowWork(false); requirePaid('Save your work'); }}>See plans</button>
              </>
            ) : saved.length === 0 ? (
              <><h2>Nothing saved yet</h2><p className="sub">Hit Save and it lands here.</p></>
            ) : (
              <ul className="work">
                {saved.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => { setDoc(structuredClone(d)); setActive(0); setShowWork(false); }}>
                      <b>{d.title}</b>
                      <small>{FORMATS[d.format].label} · {d.slides.length} slides · {new Date(d.updatedAt).toLocaleDateString()}</small>
                    </button>
                    <button className="link" onClick={() => { const n = saved.filter((x) => x.id !== d.id); setSaved(n); saveDocs(n); }}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      {note ? <div className="toast" role="status">{note}</div> : null}
    </div>
  );
}
