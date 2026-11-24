# Abundantly · link in bio

The link-in-bio page for **Abundantly** (abundantlymari.com), handing off to **Marilène Hodge** at the bottom.
One scroll is one day: morning light for Abundantly, lamplight for the founder.

- Weekly updates: see **[HOW-TO-UPDATE.md](./HOW-TO-UPDATE.md)**.
- Live address (once connected): https://links.abundantlymari.com

## What it's made of, in plain words

| Part | What it does |
| --- | --- |
| Astro | Builds the page into fast, plain HTML. |
| Keystatic (`/keystatic`) | The form you edit content in. Each save is a GitHub commit, and Vercel republishes. |
| GSAP + Lenis | The scroll choreography and smooth scrolling (desktop only, so phones and Instagram's browser scroll naturally). |
| WebGL shader (`src/scripts/silk.ts`) | The flowing silk background that turns from morning to night. |
| Klaviyo | The Weekly Signal signup goes to the list "The Weekly Signal" (single opt-in). |
| Resend | Emails media kit requests to you. |
| Upstash Redis | Counts Shop clicks for `/stats`. |

Content lives in `src/content/` (picks, links, ventures, services) and `src/data/settings.json`.

## Deploy on Vercel (first time)

1. vercel.com › **Add New › Project** › import the GitHub repository.
2. **Root Directory**: `abundantly-links`. Framework: Astro (detected). Deploy.
3. **Settings › Environment Variables**: add the ones in `.env.example` you want switched on (see the checklist below).
4. **Storage › Upstash for Redis** (free): connect it to the project for click counts.
5. **Firewall › Bot Management › AI Bots: Block** (one toggle). This refuses AI scrapers at the door.
6. Open `https://<your-project>.vercel.app/keystatic` and follow Keystatic's "Create GitHub App" screen. It fills the four Keystatic variables for you, then redeploy.

## Connect links.abundantlymari.com (DNS at WordPress.com)

1. In Vercel: Project › **Settings › Domains** › add `links.abundantlymari.com`. Vercel shows a CNAME value (normally `cname.vercel-dns.com`).
2. In WordPress.com: **Upgrades › Domains** › click `abundantlymari.com` › **DNS records** › **Manage** › **Add a record**.
3. Choose **Type: CNAME**, **Name (host)**: `links`, **Value (alias of)**: the value Vercel showed, ending with a dot if the form asks for it. Leave TTL as is. Save.
4. Back in Vercel, the domain turns green within minutes to an hour, and the security certificate is issued automatically. The main WordPress site is untouched.

## For developers

```bash
npm install
npm run dev        # http://localhost:4321 (Keystatic edits local files in dev)
npm run build      # also validates every pick against the Abundantly voice rules
npm run images     # re-process portraits from private/originals (never committed)
```

Image protection: `scripts/protect-images.mjs` (resize ≤1600px, strip EXIF, write ownership EXIF, invisible watermark), `integrations/ownership.mjs` (ownership EXIF on every other built image), `scripts/read-watermark.mjs` (decoder).
AI opt-outs: `public/robots.txt`, `public/.well-known/tdmrep.json`, `noai`/`tdm-reservation` meta tags and headers (`vercel.json`), `/terms`.

CI: `.github/workflows/abundantly-links.yml` builds and runs Lighthouse (mobile) on every push. Reports are saved as a downloadable artifact on each run.
