// Invisible watermark shared by protect-images.mjs (writes) and read-watermark.mjs (reads).
//
// How it works, in plain words: the picture is cut into small 16x16 squares. The average
// brightness of each square is nudged by at most 2 levels (out of 255) so that it lands on
// a "0" or a "1" grid. The 48-bit signature below is repeated across every square, so even
// after light JPEG/WebP compression a majority vote still reads it back.
// It survives re-saving and light compression. It does not survive heavy resizing or cropping,
// which is why we also keep EXIF ownership data and the originals off the website.

export const BLOCK = 16;
export const STEP = 4; // quantisation step; max change per pixel is STEP/2 = 2 levels
// "MH" + "AB" + 2026 as bits: Marilène Hodge, Abundantly.
export const SIGNATURE = (() => {
  const bytes = [0x4d, 0x48, 0x41, 0x42, 0x07, 0xea];
  return bytes.flatMap((b) => [7, 6, 5, 4, 3, 2, 1, 0].map((i) => (b >> i) & 1));
})();

const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

function blocks(width, height) {
  const out = [];
  for (let by = 0; by + BLOCK <= height; by += BLOCK) for (let bx = 0; bx + BLOCK <= width; bx += BLOCK) out.push([bx, by]);
  return out;
}

function blockMean(data, width, channels, bx, by) {
  let sum = 0;
  for (let y = by; y < by + BLOCK; y++)
    for (let x = bx; x < bx + BLOCK; x++) {
      const i = (y * width + x) * channels;
      sum += luma(data[i], data[i + 1], data[i + 2]);
    }
  return sum / (BLOCK * BLOCK);
}

/** Embed SIGNATURE into a raw RGB(A) buffer, in place. */
export function embed(data, width, height, channels) {
  blocks(width, height).forEach(([bx, by], k) => {
    const bit = SIGNATURE[k % SIGNATURE.length];
    const m = blockMean(data, width, channels, bx, by);
    if (m < 8 || m > 247) return; // pure black/white areas: leave untouched
    const d = bit ? STEP / 2 : 0;
    const q = STEP * Math.round((m - d) / STEP) + d;
    const shift = q - m;
    for (let y = by; y < by + BLOCK; y++)
      for (let x = bx; x < bx + BLOCK; x++) {
        const i = (y * width + x) * channels;
        for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + shift)));
      }
  });
  return data;
}

/** Read the signature back. Returns { match: 0..1, bits }. 1.0 = certain, ~0.5 = no watermark. */
export function read(data, width, height, channels) {
  const votes = SIGNATURE.map(() => [0, 0]);
  blocks(width, height).forEach(([bx, by], k) => {
    const m = blockMean(data, width, channels, bx, by);
    if (m < 8 || m > 247) return;
    const r = (((m % STEP) + STEP) % STEP) / STEP; // position inside the step, 0..1
    const bit = r > 0.25 && r < 0.75 ? 1 : 0;
    votes[k % SIGNATURE.length][bit]++;
  });
  const bits = votes.map(([z, o]) => (o > z ? 1 : 0));
  const match = bits.filter((b, i) => b === SIGNATURE[i]).length / SIGNATURE.length;
  return { match, bits };
}
