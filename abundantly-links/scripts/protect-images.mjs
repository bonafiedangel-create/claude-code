// Turns the private portrait originals into screen-sized, protected files for the website.
//   npm run images
// Reads  private/originals/hero.png and private/originals/founder.png (never committed, never published)
// Writes src/assets/portraits/{hero,founder}-{800,1600}.{webp,jpg} + lqip.json
// Each output: max 1600px, camera/location data stripped, ownership EXIF written,
// invisible watermark embedded.
import sharp from 'sharp';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { embed, read } from './watermark.mjs';

const SRC = 'private/originals';
const OUT = 'src/assets/portraits';
const YEAR = new Date().getFullYear();

export const OWNERSHIP = {
  IFD0: {
    Copyright: `Copyright ${YEAR} Marilene Hodge. All rights reserved.`,
    Artist: 'Marilene Hodge',
    ImageDescription: 'Not licensed for AI training or reuse. Use requires written permission.',
  },
};

// Backgrounds behind the cut-out portraits.
const BACKDROPS = {
  // morning: linen into the peach glow
  hero: `<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="1696"><defs>
    <radialGradient id="g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#FBE6D6"/><stop offset=".55" stop-color="#F4D9C6"/><stop offset="1" stop-color="#E9CBB8"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/></svg>`,
  // night: a warm study wall (the page tones it sepia)
  founder: `<svg xmlns="http://www.w3.org/2000/svg" width="1376" height="1696"><defs>
    <radialGradient id="g" cx="55%" cy="25%" r="85%"><stop offset="0" stop-color="#C9A98A"/><stop offset=".6" stop-color="#8E6A55"/><stop offset="1" stop-color="#4A2C27"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/></svg>`,
};

const WIDTHS = [800, 1200, 1600];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function build(name) {
  const src = `${SRC}/${name}.png`;
  if (!(await exists(src))) {
    console.log(`skip ${name}: no original at ${src}`);
    return null;
  }
  const meta = await sharp(src).metadata();
  const flat = await sharp(Buffer.from(BACKDROPS[name]))
    .resize(meta.width, meta.height)
    .composite([{ input: src }])
    .png()
    .toBuffer();

  for (const w of WIDTHS) {
    const width = Math.min(w, meta.width, 1600);
    const { data, info } = await sharp(flat).resize({ width }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    embed(data, info.width, info.height, info.channels);
    const base = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
    await base.clone().webp({ quality: 84 }).withExif(OWNERSHIP).toFile(`${OUT}/${name}-${w}.webp`);
    await base.clone().jpeg({ quality: 86, mozjpeg: true }).withExif(OWNERSHIP).toFile(`${OUT}/${name}-${w}.jpg`);

    // prove the watermark survived compression
    const back = await sharp(`${OUT}/${name}-${w}.webp`).raw().toBuffer({ resolveWithObject: true });
    const r = read(back.data, back.info.width, back.info.height, back.info.channels);
    console.log(`${name}-${w}: ${info.width}x${info.height}, watermark ${(r.match * 100).toFixed(0)}% readable after WebP`);
  }
  const tiny = await sharp(flat).resize({ width: 16 }).blur(1).webp({ quality: 40 }).toBuffer();
  return `data:image/webp;base64,${tiny.toString('base64')}`;
}

await mkdir(OUT, { recursive: true });
const lqip = {};
for (const n of ['hero', 'founder']) {
  const l = await build(n);
  if (l) lqip[n] = l;
}
await writeFile(`${OUT}/lqip.json`, JSON.stringify(lqip, null, 2));
console.log('done');
