// The Abundantly voice rules, checked every time the site builds.
// A rule broken = the build stops with a plain-words message, so nothing off-brand goes live.
import { z } from 'astro/zod';

const RULES: { re: RegExp; msg: string; picksOnly?: boolean }[] = [
  { re: /—/, msg: 'Contains an em dash (—). Use a comma, a colon or a full stop instead.' },
  { re: /\bfree\b/i, msg: 'Says "free". Abundantly says "complimentary".' },
  { re: /\bgift(ed|s)?\b/i, msg: 'Says "gift" or "gifted". For products we received, say "editorial sample".', picksOnly: true },
  {
    re: /[$€£]\s?\d|\b\d+([.,]\d{2})?\s?(usd|eur|gbp|dollars?|euros?)\b/i,
    msg: 'Contains a price. Abundantly never prints product prices.',
  },
];
const CLAIMS = /\b(cure[sd]?|treat(s|ed|ment)?|heal(s|ed|ing)?|prevent(s|ed)?|boost(s|ed)?|detox)\b/i;

export function voiceProblems(text: string | undefined | null, pick = false) {
  if (!text) return [] as string[];
  return RULES.filter((r) => (pick || !r.picksOnly) && r.re.test(text)).map((r) => r.msg);
}

/** A string field that must follow the voice rules (errors) and avoids health claims (warning). */
export const voice = (label: string, opts: { max?: number; pick?: boolean } = {}) => {
  let s = z.string();
  if (opts.max) s = s.max(opts.max, `${label} must be ${opts.max} characters or fewer.`);
  return s.superRefine((v, ctx) => {
    for (const msg of voiceProblems(v, opts.pick)) ctx.addIssue({ code: 'custom', message: `${label}: ${msg}` });
    const claim = v.match(CLAIMS);
    if (claim) console.warn(`\n⚠ ${label} uses "${claim[0]}", which can read as a health claim: "${v}"\n`);
  });
};

/** Same rules, for a field that may be left empty. */
export const optionalVoice = (label: string, opts: { max?: number; pick?: boolean } = {}) =>
  voice(label, opts)
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined);
