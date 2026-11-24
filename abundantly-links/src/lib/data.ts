import { getCollection, type CollectionEntry } from 'astro:content';
import { z } from 'astro/zod';
import rawSettings from '../data/settings.json';

export const settings = z
  .object({
    klaviyoPublicKey: z.string(),
    klaviyoListId: z.string(),
    signalSchedule: z.string(),
    businessLine: z.string(),
    currentIssueUrl: z.string(),
    disclosure: z.string().refine((s) => !s.includes('—'), 'Disclosure contains an em dash.'),
    abundantlySocials: z.array(z.object({ label: z.string(), url: z.string() })),
    founderSocials: z.array(z.object({ label: z.string(), url: z.string() })),
  })
  .parse(rawSettings);

export type Pick = CollectionEntry<'picks'>;
const byOrder = <T extends { data: { order: number } }>(a: T, b: T) => a.data.order - b.data.order;

/** YYYY-MM-DD in New York time (the Weekly Signal clock). */
export const todayET = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

export const isLive = (p: Pick, today = todayET()) =>
  (!p.data.publishFrom || p.data.publishFrom <= today) && (!p.data.publishUntil || p.data.publishUntil >= today);

/** Picks that are live now or scheduled within the next 14 days (the browser hides the future ones until their day). */
export async function homePicks() {
  const all = (await getCollection('picks')).sort(byOrder);
  const soon = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  const today = todayET();
  return all.filter((p) => (!p.data.publishUntil || p.data.publishUntil >= today) && (!p.data.publishFrom || p.data.publishFrom <= soon));
}

export const links = async () => (await getCollection('links')).filter((l) => l.data.visible).sort(byOrder);
export const house = async () => (await getCollection('house')).sort(byOrder);
export const services = async () => (await getCollection('services')).sort(byOrder);

export const isAmazon = (p: Pick) => p.data.network === 'Amazon' || /amazon\.|amzn\.(to|com)/i.test(p.data.affiliateUrl);

/** Monday of the week that contains `d`, as "Nov 23, 2026". */
export function weekOf(d = new Date()) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** ISO week key like 2026-W48 (used for click stats). */
export function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = t.getUTCFullYear();
  const w = Math.ceil(((+t - Date.UTC(y, 0, 1)) / 864e5 + 1) / 7);
  return `${y}-W${String(w).padStart(2, '0')}`;
}
