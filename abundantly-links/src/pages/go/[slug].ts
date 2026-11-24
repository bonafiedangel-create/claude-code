// /go/{slug}: counts the click, then sends the visitor to the real affiliate link.
import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { redis } from '../../lib/store';
import { isoWeek } from '../../lib/data';

export const prerender = false;

const BOT = /bot|crawl|spider|preview|facebookexternalhit|slurp|bingpreview|whatsapp|telegram/i;

export const GET: APIRoute = async ({ params, request, redirect }) => {
  const pick = params.slug ? await getEntry('picks', params.slug) : undefined;
  if (!pick || pick.data.sample || pick.data.affiliateUrl === '#') return redirect('/#picks', 302);

  let dest = pick.data.affiliateUrl;
  // UTM tags only on direct brand links: affiliate networks use their own tracking.
  if (pick.data.network === 'Direct' && !/[?&]utm_/.test(dest)) {
    const u = new URL(dest);
    u.searchParams.set('utm_source', 'abundantly');
    u.searchParams.set('utm_medium', 'link_in_bio');
    u.searchParams.set('utm_campaign', pick.id);
    dest = u.toString();
  }

  if (redis && !BOT.test(request.headers.get('user-agent') || '')) {
    const week = isoWeek();
    await Promise.all([
      redis.hincrby('clicks:pick', pick.id, 1),
      redis.hincrby('clicks:network', pick.data.network, 1),
      redis.hincrby(`clicks:week:${week}`, pick.id, 1),
      redis.sadd('clicks:weeks', week),
    ]).catch(() => {});
  }

  return new Response(null, {
    status: 302,
    headers: {
      location: dest,
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
      'referrer-policy': 'no-referrer-when-downgrade',
    },
  });
};
