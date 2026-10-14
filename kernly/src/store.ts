import { Brand, Doc, Plan } from './types';
import { DEFAULT_BRAND } from './brand';

const K = { brands: 'kernly:brands', docs: 'kernly:docs', plan: 'kernly:plan', session: 'kernly:session' };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the app still works, nothing persists */
  }
}

export const loadPlan = (): Plan => read<Plan>(K.plan, 'free');
export const savePlan = (p: Plan, session?: string) => {
  write(K.plan, p);
  if (session) write(K.session, session);
};
export const loadBrands = (): Brand[] => read<Brand[]>(K.brands, [DEFAULT_BRAND]);
export const saveBrands = (b: Brand[]) => write(K.brands, b);
export const loadDocs = (): Doc[] => read<Doc[]>(K.docs, []);
export const saveDocs = (d: Doc[]) => write(K.docs, d);
