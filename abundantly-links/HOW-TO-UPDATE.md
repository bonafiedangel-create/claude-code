# How to update your link in bio

Everything below happens in your browser. No code.

## Add this week's picks (under five minutes)

1. Go to **links.abundantlymari.com/keystatic** and sign in with GitHub.
2. Open **Picks (tested and kept)** › **Add**.
3. Fill in the form: product name, brand, category, the affiliate link, the tester's note (140 characters max), how long you tested it, and upload the product photo. Add the offer line and discount code if there is one. Never a price.
4. **Disclosure**: choose *Editorial*, *Editorial sample* (the brand sent it) or *Sponsored* (paid). The right pill appears on the card by itself.
5. **Affiliate network**: pick Awin, Impact, CJ, Sovrn, Amazon or Direct. If you choose Amazon, the Amazon Associate line appears automatically.
6. Click **Save**. Keystatic saves it to GitHub, and Vercel puts the new version live in about a minute.

If a note breaks a voice rule (an em dash, "free", "gift", a price), the update will not go live, and the build log on Vercel says exactly which word to change. Words like "cure", "treat", "heal" or "boosts" only show a warning.

**Retiring a placeholder:** open any pick whose name starts with a sample product and either replace its content with a real pick (untick *Placeholder*) or delete it.

## Schedule next week in advance

Fill in **Show from** and **Show until** on a pick. It stays hidden until its first day and moves to the archive (/picks) after its last day. A daily rebuild keeps this on time: in Vercel › Project › Settings › Git › Deploy Hooks, create a hook named "daily", copy its link, then in GitHub › repository › Settings › Secrets › Actions add it as `VERCEL_DEPLOY_HOOK`.

## Edit links, ventures and services

Same place: **Start here links**, **The house (ventures)**, **Work with her (services)**, and **Settings** (socials, business line, Weekly Signal time, disclosure text).

## Swap a portrait

The portraits are protected (resized, watermarked, ownership data written), so they go through one step on a computer:

1. Put the new photo in `private/originals/` named `hero.png` (the morning arch) or `founder.png` (the gilt frame). PNG with a removed background works best.
2. Run `npm run images`, then commit the changed files in `src/assets/portraits/`.

Or ask Claude Code: "swap the hero portrait for this photo".

## See your clicks

Open **links.abundantlymari.com/stats** and enter the stats password. You'll see clicks per pick, per network and per week. Page views are under Vercel › Project › Analytics.

## Check if a copied photo is yours

`npm run watermark:check -- path/to/the-copy.jpg` gives a percentage: 90% or more proves it was saved from your site.
