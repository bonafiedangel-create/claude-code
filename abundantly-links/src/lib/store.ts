// Tiny key-value store for click counts and rate limits.
// Uses Upstash Redis (free tier) when its keys are set in Vercel; otherwise counts are skipped
// and the site keeps working.
import { Redis } from '@upstash/redis';

const url = import.meta.env.UPSTASH_REDIS_REST_URL || import.meta.env.KV_REST_API_URL;
const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN || import.meta.env.KV_REST_API_TOKEN;
export const redis = url && token ? new Redis({ url, token }) : null;

const memory = new Map<string, { n: number; until: number }>();

/** True when `key` has been used more than `max` times in `seconds`. */
export async function limited(key: string, max: number, seconds: number) {
  if (redis) {
    const n = await redis.incr(`rl:${key}`).catch(() => 0);
    if (n === 1) await redis.expire(`rl:${key}`, seconds).catch(() => {});
    return n > max;
  }
  const now = Date.now();
  const e = memory.get(key);
  if (!e || e.until < now) {
    memory.set(key, { n: 1, until: now + seconds * 1000 });
    return false;
  }
  e.n++;
  return e.n > max;
}

export const clientIp = (req: Request) =>
  req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
