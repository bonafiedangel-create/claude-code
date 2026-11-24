import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { voice, optionalVoice } from './lib/editorial';

const date = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .or(z.literal(''))
  .nullable()
  .transform((v) => v || undefined);

const picks = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/picks' }),
  schema: ({ image }) =>
    z.object({
      name: voice('Name', { pick: true }),
      brand: voice('Brand', { pick: true }),
      category: voice('Category', { pick: true }),
      offer: optionalVoice('Offer', { pick: true }),
      code: z
        .string()
        .optional()
        .or(z.literal(''))
        .transform((v) => v || undefined),
      image: image().optional().nullable(),
      imageAlt: z.string().optional().default(''),
      affiliateUrl: z.url().or(z.literal('#')),
      note: voice("Tester's note", { max: 140, pick: true }),
      tested: voice('Tested for', { pick: true }),
      period: z.enum(['week', 'month']).default('week'),
      verdict: z.enum(['Kept', 'New']).default('Kept'),
      status: z.enum(['editorial', 'editorial-sample', 'sponsored']).default('editorial'),
      network: z.enum(['Awin', 'Impact', 'CJ', 'Sovrn', 'Amazon', 'Direct']).default('Direct'),
      publishFrom: date,
      publishUntil: date,
      order: z.number().default(0),
      sample: z.boolean().default(false),
    }),
});

const links = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/links' }),
  schema: z.object({
    title: voice('Link title'),
    description: voice('Link description'),
    url: z.string(),
    badge: z
      .string()
      .optional()
      .or(z.literal(''))
      .transform((v) => v || undefined),
    highlight: z.boolean().default(false),
    order: z.number().default(0),
    visible: z.boolean().default(true),
  }),
});

const house = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/house' }),
  schema: z.object({
    name: z.string(),
    numeral: z.string(),
    kind: z.string(),
    text: voice('Venture description'),
    url: z.string(),
    cta: z.string(),
    order: z.number().default(0),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    numeral: z.string(),
    text: voice('Service description'),
    order: z.number().default(0),
  }),
});

export const collections = { picks, links, house, services };
