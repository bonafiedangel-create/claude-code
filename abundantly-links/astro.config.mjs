import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import ownership from './integrations/ownership.mjs';

export default defineConfig({
  site: 'https://links.abundantlymari.com',
  output: 'static', // every page is pre-built; only /go, /api, /stats and /keystatic run on demand
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [react(), keystatic(), ownership()],
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
