// One scroll is one day. Everything that moves lives here.
// The page is fully readable without this file; it only adds motion and interactivity.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { initSilk } from './silk';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll(s)] as T[];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;
const firstVisit = root.classList.contains('first-visit');
const introDelay = firstVisit && !reduce ? 1.7 : 0.15;

/* ---------- quiet image protection (no message, nothing visible) ---------- */
document.addEventListener('contextmenu', (e) => {
  if ((e.target as Element).closest?.('.arch,.frame,.portrait-stage,.art')) e.preventDefault();
});
document.addEventListener('dragstart', (e) => {
  if ((e.target as Element).tagName === 'IMG') e.preventDefault();
});

/* ---------- loader ---------- */
if (firstVisit && reduce) root.classList.remove('first-visit');

/* ---------- smooth scrolling (desktop only: never fights in-app browsers on phones) ---------- */
let lenis: Lenis | null = null;
if (!reduce && finePointer) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
  if (!a || a.getAttribute('href') === '#') return;
  const el = document.querySelector(a.getAttribute('href')!);
  if (!el) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(el as HTMLElement, { offset: -60 });
  else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  if (el instanceof HTMLElement && el.id === 'signal') setTimeout(() => $<HTMLInputElement>('#email')?.focus({ preventScroll: true }), 900);
});

/* ---------- headline: word by word ---------- */
const headline = $('#headline');
if (headline && !reduce) {
  const words: HTMLElement[] = [];
  const wrap = (node: Node) => {
    [...node.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent!.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const w = document.createElement('span');
          w.className = 'w';
          const s = document.createElement('span');
          s.textContent = part;
          w.append(s);
          frag.append(w);
          words.push(s);
        });
        c.replaceWith(frag);
      } else wrap(c);
    });
  };
  headline.setAttribute('aria-label', headline.textContent!.trim());
  wrap(headline);
  $$('.w', headline).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  gsap.from(words, { yPercent: 105, rotate: 4, duration: 1.1, ease: 'power3.out', stagger: 0.07, delay: introDelay });
  gsap.from('.hero .lede, .hero .lede-small, .hero .cta-row, .hero .meta', {
    y: 18,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    delay: introDelay + 0.35,
    ease: 'power2.out',
  });
}

/* ---------- section reveals and counters ---------- */
if (!reduce) {
  $$('.reveal').forEach((el) =>
    gsap.from(el, { y: 26, opacity: 0, duration: 0.9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }),
  );
  $$('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end,
      duration: 1.6,
      ease: 'power2.out',
      onUpdate: () => (el.textContent = String(Math.round(o.v))),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

/* ---------- day to night ---------- */
let night = 0;
const dusk = $('.dusk')!;
ScrollTrigger.create({
  trigger: dusk,
  start: 'top 75%',
  end: 'bottom 10%',
  scrub: reduce ? false : 0.6,
  onUpdate: (st) => {
    night = st.progress;
    root.style.setProperty('--n', night.toFixed(3));
    document.body.classList.toggle('night-cursor', night > 0.6);
  },
});
const metaTheme = $<HTMLMetaElement>('meta[name="theme-color"]');
ScrollTrigger.create({
  trigger: '#founder',
  start: 'top 40%',
  onToggle: (st) => metaTheme?.setAttribute('content', st.isActive ? '#2A0D12' : '#F7EEE5'),
});

/* ---------- silk background ---------- */
const silk = initSilk($<HTMLCanvasElement>('#silk')!, reduce, !finePointer);
// Start the silk once the page has settled, so the first paint stays fast.
const startSilk = () => silk.start();
addEventListener(
  'load',
  () => ('requestIdleCallback' in window ? requestIdleCallback(startSilk, { timeout: 2500 }) : setTimeout(startSilk, 1200)),
  { once: true },
);
['pointerdown', 'scroll', 'keydown'].forEach((ev) => addEventListener(ev, startSilk, { once: true, passive: true }));

// Only animate what is on screen.
const onScreen = new Map<Element, boolean>();
const watch = new IntersectionObserver((es) => es.forEach((e) => onScreen.set(e.target, e.isIntersecting)), { rootMargin: '100px' });
const visible = (el: Element | null) => !!el && onScreen.get(el) === true;

/* ---------- start here: portrait tilt or idle float ---------- */
const stageEl = $('#tiltStage');
if (stageEl && !finePointer && !reduce) stageEl.classList.add('floating');

/* ---------- the 3D ring of picks ---------- */
const stage = $('#stage')!;
const ringset = $('#ringset')!;
const hint = $('#hint')!;
const allCards = $$('.card', ringset);
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
allCards.forEach((c) => {
  const { from, until } = c.dataset;
  c.hidden = (!!from && from > today) || (!!until && until < today);
});
let mode = 'week';
let cards: HTMLElement[] = [];
let N = 0,
  R = 0,
  angle = 0,
  target = 0,
  vel = 0,
  idleT = 0,
  front = -1;
let dragging = false,
  moved = false,
  lastX = 0,
  downX = 0,
  downY = 0,
  decided = false;
const step = () => 360 / Math.max(N, 1);
const frontIndex = () => (N ? Math.round((((-angle % 360) + 360) % 360) / step()) % N : 0);

function layout() {
  cards = allCards.filter((c) => !c.hidden && c.dataset.period === mode);
  allCards.forEach((c) => (c.style.display = cards.includes(c) ? '' : 'none'));
  N = cards.length;
  const w = Math.min(250, Math.max(200, stage.clientWidth * 0.26));
  ringset.style.setProperty('--cw', w + 'px');
  R = N > 1 ? w / 2 / Math.tan(Math.PI / Math.max(N, 3)) + 34 : 0;
  angle = target = 0;
  front = -1;
  cards.forEach((c) => c.classList.remove('flipped'));
  place();
}
function place() {
  ringset.style.transform = `translateZ(${-R}px) rotateY(${angle}deg)`;
  cards.forEach((c, i) => {
    const a = ((i * step() + angle) * Math.PI) / 180,
      f = (Math.cos(a) + 1) / 2;
    c.style.transform = `rotateY(${i * step()}deg) translateZ(${R}px)`;
    c.style.opacity = (0.25 + 0.75 * f).toFixed(3);
    c.style.filter = `saturate(${0.6 + 0.4 * f}) brightness(${0.9 + 0.1 * f})`;
    c.style.zIndex = String(Math.round(f * 100));
    c.style.pointerEvents = f > 0.55 ? 'auto' : 'none';
  });
  const fi = frontIndex();
  if (fi !== front) {
    front = fi;
    cards.forEach((c, i) => {
      c.setAttribute('aria-hidden', String(i !== fi));
      c.inert = i !== fi;
    });
    if (cards[fi]) hint.textContent = `${fi + 1} of ${N} · ${cards[fi].querySelector('h3')?.textContent}`;
  }
}
const goTo = (i: number) => {
  const want = -i * step();
  target = want + Math.round((angle - want) / 360) * 360;
  idleT = performance.now();
};
const unflip = () => cards.forEach((x) => x.classList.remove('flipped'));

if (allCards.length) {
  stage.classList.add('ring-ready');
  stage.tabIndex = 0;
  layout();
  watch.observe(stage);
  addEventListener('resize', layout);

  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    decided = false;
    moved = false;
    lastX = downX = e.clientX;
    downY = e.clientY;
    vel = 0;
  });
  addEventListener('pointermove', (e) => {
    if (!dragging) return;
    if (!decided) {
      const dx = Math.abs(e.clientX - downX),
        dy = Math.abs(e.clientY - downY);
      if (dx < 6 && dy < 6) return;
      decided = true;
      if (dy > dx) {
        dragging = false;
        return;
      } // vertical swipe: let the page scroll
    }
    const dx = e.clientX - lastX;
    lastX = e.clientX;
    moved = true;
    angle += dx * 0.35;
    target = angle;
    vel = dx * 0.35;
    idleT = performance.now();
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    const s = step();
    target = Math.round((angle + vel * 8) / s) * s;
    idleT = performance.now();
    setTimeout(() => (moved = false), 50);
  };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);

  allCards.forEach((c) =>
    c.addEventListener('click', (e) => {
      const t = e.target as Element;
      const cp = t.closest('.copy') as HTMLButtonElement | null;
      if (cp) {
        e.stopPropagation();
        navigator.clipboard
          ?.writeText(cp.dataset.code!)
          .then(() => (cp.textContent = cp.dataset.code + ' · copied'))
          .catch(() => {});
        return;
      }
      if (t.closest('a') || moved) return;
      const i = cards.indexOf(c);
      if (i === frontIndex()) c.classList.toggle('flipped');
      else {
        unflip();
        goTo(i);
      }
    }),
  );
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      unflip();
      target += step();
      idleT = performance.now();
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      unflip();
      target -= step();
      idleT = performance.now();
      e.preventDefault();
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target === stage) {
      cards[frontIndex()]?.classList.toggle('flipped');
      e.preventDefault();
    }
  });
  $('#prev')!.onclick = () => {
    unflip();
    target += step();
    idleT = performance.now();
  };
  $('#next')!.onclick = () => {
    unflip();
    target -= step();
    idleT = performance.now();
  };

  $$<HTMLButtonElement>('.toggle button').forEach(
    (b) =>
      (b.onclick = () => {
        if (mode === b.dataset.mode) return;
        $$('.toggle button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        $('#picksHead')!.innerHTML = b.dataset.mode === 'week' ? "This week's <em>signal.</em>" : "This month's <em>keepers.</em>";
        const swap = () => {
          mode = b.dataset.mode!;
          layout();
        };
        if (reduce) return swap();
        gsap.to(ringset, {
          opacity: 0,
          scale: 0.9,
          duration: 0.28,
          ease: 'power1.in',
          onComplete: () => {
            swap();
            gsap.to(ringset, { opacity: 1, scale: 1, duration: 0.42 });
          },
        });
      }),
  );
}

/* ---------- card catalog drawers ---------- */
$$<HTMLButtonElement>('.drawer .front').forEach((b) =>
  b.addEventListener('click', () => {
    const d = b.parentElement!,
      open = !d.classList.contains('open');
    d.classList.toggle('open', open);
    b.setAttribute('aria-expanded', String(open));
  }),
);

/* ---------- candle dust ---------- */
const nightEl = $('#founder')!;
const motes = $<HTMLCanvasElement>('#motes')!;
const mctx = motes.getContext('2d')!;
let dots: { x: number; y: number; r: number; s: number; a: number; p: number }[] = [];
let nightVisible = false;
function sizeMotes() {
  motes.width = nightEl.clientWidth;
  motes.height = nightEl.clientHeight;
  dots = Array.from({ length: Math.min(90, Math.round((motes.width * motes.height) / 26000)) }, () => ({
    x: Math.random() * motes.width,
    y: Math.random() * motes.height,
    r: Math.random() * 1.6 + 0.3,
    s: Math.random() * 0.25 + 0.05,
    a: Math.random() * 0.5 + 0.15,
    p: Math.random() * 6.28,
  }));
}
sizeMotes();
addEventListener('resize', sizeMotes);
new IntersectionObserver(([e]) => (nightVisible = e.isIntersecting)).observe(nightEl);

/* ---------- pointer effects (desktop) ---------- */
const cur = $('.cursor')!;
let cx = 0,
  cy = 0,
  tx = 0,
  ty = 0;
if (finePointer && !reduce) {
  addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cur.classList.add('on');
    silk.pointer(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
  });
  document.addEventListener('pointerover', (e) =>
    cur.classList.toggle('big', !!(e.target as Element).closest?.('a,button,[data-big],.card')),
  );
  const tilt = (area: HTMLElement | null, el: HTMLElement | null, amt: number) => {
    if (!area || !el) return;
    area.addEventListener('pointermove', (e) => {
      const b = area.getBoundingClientRect(),
        x = (e.clientX - b.left) / b.width - 0.5,
        y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `rotateY(${x * amt}deg) rotateX(${-y * amt}deg)`;
    });
    area.addEventListener('pointerleave', () => (el.style.transform = ''));
  };
  tilt($('#tiltStage'), $('#arch'), 14);
  tilt($('#frame'), $('#frame'), 10);
  $$('[data-magnet]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    b.addEventListener('pointerleave', () => (b.style.transform = ''));
  });
  nightEl.addEventListener('pointermove', (e) => {
    const r = nightEl.getBoundingClientRect();
    nightEl.style.setProperty('--lx', e.clientX - r.left + 'px');
    nightEl.style.setProperty('--ly', e.clientY - r.top + 'px');
  });
}

/* ---------- back to morning ---------- */
$('#sunrise')!.onclick = () => {
  if (lenis) lenis.scrollTo(0, { duration: 2.4 });
  else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
};

/* ---------- forms ---------- */
const started = Date.now();
$$<HTMLInputElement>('input[name="t"]').forEach((i) => (i.value = String(started)));

async function send(form: HTMLFormElement, url: string) {
  const data = Object.fromEntries(new FormData(form));
  const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Something went wrong on our side. Please try again in a minute.');
  return body;
}

const signup = $<HTMLFormElement>('#signupForm');
signup?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = $('#formNote')!,
    btn = $<HTMLButtonElement>('button', signup)!;
  const email = $<HTMLInputElement>('#email')!.value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    note.dataset.state = 'error';
    note.className = 'note';
    note.textContent = 'Please enter a full email address, like name@example.com.';
    return;
  }
  btn.disabled = true;
  try {
    await send(signup, '/api/subscribe');
    note.dataset.state = 'ok';
    note.className = 'ok';
    note.textContent = 'Lovely. Your complimentary Wellness Audit is on its way.';
    signup.reset();
  } catch (err) {
    note.dataset.state = 'error';
    note.className = 'note';
    note.textContent = (err as Error).message;
  } finally {
    btn.disabled = false;
  }
});

const mk = $<HTMLFormElement>('#media-kit');
mk?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const note = $('.mk-note', mk)!,
    btn = $<HTMLButtonElement>('button[type="submit"]', mk)!;
  if (!mk.checkValidity()) {
    note.textContent = 'Please add your name, brand, email and a short message.';
    return;
  }
  btn.disabled = true;
  try {
    await send(mk, '/api/media-kit');
    note.textContent = 'Thank you. Your request is with her office, and the media kit will follow by email.';
    mk.reset();
  } catch (err) {
    note.textContent = (err as Error).message;
  } finally {
    btn.disabled = false;
  }
});

/* ---------- main loop ---------- */
const track = $('#track')!;
watch.observe(track);
let mq = 0,
  lastY = scrollY,
  boost = 0;
const t0 = performance.now();
gsap.ticker.add(() => {
  const now = performance.now(),
    t = (now - t0) / 1000;
  silk.draw(t, night);
  if (N && visible(stage)) {
    const before = angle;
    if (!dragging) {
      if (!reduce && now - idleT > 4500 && !cards.some((c) => c.classList.contains('flipped')) && N > 1) target -= 0.06;
      angle += (target - angle) * 0.09;
    }
    if (dragging || Math.abs(angle - before) > 0.0005) place();
  }
  if (!reduce && visible(track)) {
    const dy = scrollY - lastY;
    lastY = scrollY;
    boost += (Math.abs(dy) * 0.25 - boost) * 0.1;
    mq -= 0.5 + boost;
    const half = track.scrollWidth / 2;
    if (-mq > half) mq += half;
    track.style.transform = `translateX(${mq}px)`;
  }
  if (finePointer && !reduce) {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cur.style.transform = `translate(${cx}px,${cy}px)`;
  }
  if (nightVisible) {
    mctx.clearRect(0, 0, motes.width, motes.height);
    for (const d of dots) {
      if (!reduce) {
        d.y -= d.s;
        d.x += Math.sin(t * 0.6 + d.p) * 0.15;
        if (d.y < -4) {
          d.y = motes.height + 4;
          d.x = Math.random() * motes.width;
        }
      }
      mctx.beginPath();
      mctx.arc(d.x, d.y, d.r, 0, 6.283);
      mctx.fillStyle = `rgba(242,196,141,${d.a * (0.6 + 0.4 * Math.sin(t * 1.3 + d.p))})`;
      mctx.fill();
    }
  }
});
