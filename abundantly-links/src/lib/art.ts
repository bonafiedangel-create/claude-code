// Soft illustrated stand-ins, shown only until a real product photo is uploaded.
const pickArt: Record<string, string> = {
  Mind: 'band',
  Sleep: 'fold',
  Ritual: 'stone',
  Home: 'candle',
  Desk: 'book',
  Table: 'cup',
  Wardrobe: 'fold',
  Skin: 'bottle',
  Rest: 'stone',
  'Beauty tech': 'mask',
};
const glows = ['#EFD9CC', '#F4D9C6', '#F3D1C9', '#F6E1C2', '#EFD3C4', '#E9D6C6', '#E7DCC6'];

export const glowFor = (i: number) => glows[i % glows.length];

export function art(category: string) {
  const type = pickArt[category] ?? 'jar';
  const sh = `<ellipse cx="100" cy="196" rx="54" ry="7" fill="rgba(90,40,25,.18)"/>`;
  const g = `<defs><linearGradient id="gA" x1="0" x2="1"><stop offset="0" stop-color="#C98F78"/><stop offset=".45" stop-color="#E7B9A4"/><stop offset="1" stop-color="#9C5E3F"/></linearGradient>
    <linearGradient id="gB" x1="0" x2="1"><stop offset="0" stop-color="#E9DCCF"/><stop offset=".5" stop-color="#FFFCF9"/><stop offset="1" stop-color="#CDBBA9"/></linearGradient>
    <linearGradient id="gC" x1="0" x2="1"><stop offset="0" stop-color="#3a3330"/><stop offset=".5" stop-color="#6b605a"/><stop offset="1" stop-color="#2a2522"/></linearGradient></defs>`;
  const m: Record<string, string> = {
    bottle: `<rect x="72" y="88" width="56" height="106" rx="14" fill="url(#gA)"/><rect x="88" y="66" width="24" height="26" rx="3" fill="url(#gB)"/><rect x="84" y="46" width="32" height="24" rx="6" fill="url(#gC)"/><rect x="80" y="122" width="40" height="34" rx="2" fill="#FFFCF9" opacity=".85"/><rect x="86" y="132" width="28" height="2" fill="#9C5E3F"/>`,
    jar: `<rect x="58" y="126" width="84" height="68" rx="16" fill="url(#gB)"/><rect x="54" y="104" width="92" height="28" rx="8" fill="url(#gA)"/><rect x="72" y="150" width="56" height="22" rx="2" fill="#FFFCF9" opacity=".9"/><rect x="82" y="159" width="36" height="2" fill="#9C5E3F"/>`,
    candle: `<rect x="62" y="70" width="18" height="124" rx="4" fill="url(#gB)"/><rect x="104" y="58" width="18" height="136" rx="4" fill="url(#gB)"/><path d="M71 46c-6 10-6 18 0 22 6-4 6-12 0-22z" fill="#F2B36E"/><path d="M113 34c-6 10-6 18 0 22 6-4 6-12 0-22z" fill="#F2B36E"/>`,
    mask: `<path d="M100 54c34 0 52 24 52 62 0 40-24 76-52 76s-52-36-52-76c0-38 18-62 52-62z" fill="url(#gB)"/><ellipse cx="80" cy="112" rx="13" ry="8" fill="#5a4a44"/><ellipse cx="120" cy="112" rx="13" ry="8" fill="#5a4a44"/>`,
    book: `<rect x="56" y="64" width="92" height="126" rx="4" fill="url(#gA)"/><rect x="56" y="64" width="12" height="126" fill="rgba(0,0,0,.12)"/><rect x="146" y="68" width="6" height="118" fill="#FFFCF9"/><path d="M122 64v52l8-7 8 7V64z" fill="#7a2a2a"/>`,
    fold: `<rect x="46" y="150" width="112" height="40" rx="10" fill="url(#gB)"/><rect x="50" y="116" width="104" height="38" rx="10" fill="url(#gA)"/><rect x="54" y="84" width="96" height="36" rx="10" fill="#EBD8CB"/>`,
    cup: `<path d="M58 120h84l-8 58a14 14 0 0 1-14 12H80a14 14 0 0 1-14-12z" fill="url(#gB)"/><path d="M142 132c22 0 22 30 0 30" fill="none" stroke="#DCCFC2" stroke-width="8"/><ellipse cx="100" cy="120" rx="42" ry="8" fill="#8C9A62"/>`,
    band: `<path d="M44 150c0-60 25-92 56-92s56 32 56 92" fill="none" stroke="url(#gC)" stroke-width="16" stroke-linecap="round"/><rect x="34" y="138" width="22" height="34" rx="9" fill="url(#gC)"/><rect x="144" y="138" width="22" height="34" rx="9" fill="url(#gC)"/>`,
    stone: `<path d="M100 74c34 0 58 20 58 52s-24 64-58 64-58-32-58-64 24-52 58-52z" fill="url(#gA)" opacity=".92"/><path d="M84 92c-14 8-18 22-16 34" stroke="#FFFCF9" stroke-width="5" stroke-linecap="round" opacity=".6"/>`,
  };
  return `<svg viewBox="0 0 200 220" aria-hidden="true">${g}${sh}${m[type]}</svg>`;
}
