// The visual editor at /keystatic. Each field below is one box in the form.
import { config, collection, singleton, fields } from '@keystatic/core';

const repo = (import.meta.env.PUBLIC_KEYSTATIC_REPO || 'bonafiedangel-create/claude-code') as `${string}/${string}`;
const pathPrefix = import.meta.env.PUBLIC_KEYSTATIC_PATH_PREFIX ?? 'abundantly-links';

const voiceHint = 'No em dashes, no prices. Say "complimentary" (not free) and "editorial sample" (not gift). No health claims.';

export default config({
  storage: import.meta.env.PROD ? { kind: 'github', repo, pathPrefix: pathPrefix || undefined } : { kind: 'local' },
  ui: {
    brand: { name: 'Abundantly links' },
    navigation: { 'This week': ['picks'], Page: ['links', 'settings'], 'Marilène Hodge': ['house', 'services'] },
  },
  collections: {
    picks: collection({
      label: 'Picks (tested and kept)',
      slugField: 'name',
      path: 'src/content/picks/*',
      format: { data: 'json' },
      columns: ['name', 'period', 'publishFrom'],
      schema: {
        name: fields.slug({
          name: { label: 'Product name' },
          slug: { label: 'Short link name', description: 'Used in the /go/ link. Keep it short.' },
        }),
        brand: fields.text({ label: 'Brand' }),
        category: fields.text({ label: 'Category', description: 'One or two words, e.g. Sleep, Skin, Mind' }),
        image: fields.image({
          label: 'Product photo',
          directory: 'src/assets/picks',
          publicPath: '../../assets/picks/',
          description: 'A real, natural-light photo. Square or portrait works best.',
        }),
        imageAlt: fields.text({ label: 'Photo description (for screen readers)' }),
        affiliateUrl: fields.url({ label: 'Affiliate link', validation: { isRequired: true } }),
        offer: fields.text({ label: 'Offer line (optional)', description: 'e.g. "20% off with code". Never a price.' }),
        code: fields.text({ label: 'Discount code (optional)' }),
        note: fields.text({ label: "Tester's note", multiline: true, validation: { length: { max: 140 } }, description: voiceHint }),
        tested: fields.text({ label: 'Tested for', description: 'e.g. 3 weeks' }),
        period: fields.select({
          label: 'Show in',
          options: [
            { label: 'Of the week', value: 'week' },
            { label: 'Of the month', value: 'month' },
          ],
          defaultValue: 'week',
        }),
        verdict: fields.select({
          label: 'Verdict pill',
          options: [
            { label: 'Kept', value: 'Kept' },
            { label: 'New', value: 'New' },
          ],
          defaultValue: 'Kept',
        }),
        status: fields.select({
          label: 'Disclosure',
          options: [
            { label: 'Editorial (bought or borrowed, nothing to disclose)', value: 'editorial' },
            { label: 'Editorial sample (the brand sent it)', value: 'editorial-sample' },
            { label: 'Sponsored (paid placement)', value: 'sponsored' },
          ],
          defaultValue: 'editorial',
        }),
        network: fields.select({
          label: 'Affiliate network',
          options: ['Awin', 'Impact', 'CJ', 'Sovrn', 'Amazon', 'Direct'].map((v) => ({ label: v, value: v })),
          defaultValue: 'Direct',
        }),
        publishFrom: fields.date({ label: 'Show from', description: 'Leave empty to show right away.' }),
        publishUntil: fields.date({ label: 'Show until', description: 'After this date it moves to the archive only.' }),
        order: fields.integer({ label: 'Order', defaultValue: 0, description: 'Lower numbers come first.' }),
        sample: fields.checkbox({ label: 'Placeholder (not a real pick yet)', defaultValue: false }),
      },
    }),
    links: collection({
      label: 'Start here links',
      slugField: 'title',
      path: 'src/content/links/*',
      format: { data: 'json' },
      columns: ['title', 'order'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'One-line description' }),
        url: fields.text({ label: 'Link' }),
        badge: fields.text({ label: 'Badge (optional)', description: 'e.g. New, Podcast' }),
        highlight: fields.checkbox({ label: 'Make the badge stand out', defaultValue: false }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
        visible: fields.checkbox({ label: 'Show on the page', defaultValue: true }),
      },
    }),
    house: collection({
      label: 'The house (ventures)',
      slugField: 'name',
      path: 'src/content/house/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Venture name' } }),
        numeral: fields.text({ label: 'Drawer numeral', description: 'I, II, III…' }),
        kind: fields.text({ label: 'Small label under the name' }),
        text: fields.text({ label: 'Index card text', multiline: true }),
        url: fields.text({ label: 'Link' }),
        cta: fields.text({ label: 'Link text' }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
    services: collection({
      label: 'Work with her (services)',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Service' } }),
        numeral: fields.text({ label: 'Numeral', description: 'i., ii., iii.…' }),
        text: fields.text({ label: 'Description', multiline: true }),
        order: fields.integer({ label: 'Order', defaultValue: 0 }),
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: 'Settings',
      path: 'src/data/settings',
      format: { data: 'json' },
      schema: {
        klaviyoPublicKey: fields.text({ label: 'Klaviyo public key (Site ID)' }),
        klaviyoListId: fields.text({ label: 'Klaviyo list ID' }),
        signalSchedule: fields.text({ label: 'Weekly Signal day and time' }),
        businessLine: fields.text({ label: 'Business line' }),
        currentIssueUrl: fields.url({ label: 'Current issue link' }),
        disclosure: fields.text({ label: 'Affiliate disclosure', multiline: true }),
        abundantlySocials: fields.array(fields.object({ label: fields.text({ label: 'Name' }), url: fields.url({ label: 'Link' }) }), {
          label: 'Abundantly socials',
          itemLabel: (p) => p.fields.label.value,
        }),
        founderSocials: fields.array(fields.object({ label: fields.text({ label: 'Name' }), url: fields.text({ label: 'Link' }) }), {
          label: 'Marilène Hodge socials',
          itemLabel: (p) => p.fields.label.value,
        }),
      },
    }),
  },
});
