# Brand Studio (working title)

Make it look like you. Carousels, single posts and decks in your own brand: pick colours,
fonts, a signature detail and a voice once, and every slide after that is on-brand.

**Free to try, pay to keep.** Everything is usable with the built-in examples. Saving
projects, clean (no watermark) PNG/PDF/ZIP export, AI copy and tone rewrites are paid.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173  (set VITE_APP_NAME=YourName to rename the product everywhere) — "Dev only: unlock Pro" button appears in the paywall
npm run build
```

The AI and checkout endpoints live in `api/` and run as Vercel serverless functions
(`vercel dev` locally). Without keys the app still works: copy falls back to the built-in writer.

## Deploy (about 15 minutes)

1. Push the repo, import it in Vercel, set the root directory to `kernly` (this folder; rename it freely).
2. In Stripe create products and recurring prices, then add them as env vars (see `.env.example`):

   | Plan   | Monthly | Yearly (per month) | Target audience |
   |--------|---------|--------------------|-----------------|
   | Pro    | $12     | $96/yr ($8)        | solo creators, coaches |
   | Studio | $29     | $240/yr ($20)      | agencies, multi-client |

3. Add `ANTHROPIC_API_KEY`. The default model is Haiku (`ANTHROPIC_MODEL` to change):
   roughly a fraction of a cent per generated deck, so margins stay above 90%.
4. Point your domain at the Vercel project.

## Known gaps before launch

- **Unlock is per-browser.** `api/verify.ts` confirms a Stripe session and unlocks the browser that paid.
  For cross-device access add accounts (Supabase auth) plus a Stripe webhook that stores the plan.
- **Projects save to local storage.** Move `src/store.ts` to a database once accounts exist.
- **Rate limits are in-memory per IP** (`api/_ai.ts`). Switch to per-account quotas with accounts.
- Fonts load from Google Fonts; export needs a connection.

## Structure

- `src/styles.tsx` — the 9 visual styles (add one by adding an object)
- `src/SlideView.tsx` — the 9 slide layouts (cover, point, list, steps, stat, quote, compare, chart, cta), signature rendering, stair and growth charts
- `src/ai.ts` — AI writing with offline fallback
- `src/export.ts` — PNG, ZIP, PDF
- `api/` — `write`, `rewrite`, `checkout`, `verify`
- `src/config.ts` — the product name and tagline (single source of truth)
- `src/templates.ts` — the template gallery (10 starters; add one by adding an object)
- `src/Logo.tsx` — placeholder mark; replace with the real logo once the name is final
