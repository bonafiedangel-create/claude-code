// One place for the product name. Set VITE_APP_NAME at build time, or edit the fallback.
export const APP = {
  name: (import.meta.env.VITE_APP_NAME as string | undefined) || 'Brand Studio',
  tagline: 'Make it look like you.',
  description: 'Carousels, posts and decks in your own brand. Pick colours, fonts and a voice once; every slide after that is on-brand.',
};
export const APP_SLUG = APP.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const APP_INITIAL = APP.name.trim().charAt(0).toLowerCase();
