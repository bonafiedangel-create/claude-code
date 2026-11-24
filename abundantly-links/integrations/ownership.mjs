// After every build: write ownership data (Copyright, Artist, "not licensed for AI") into every
// published image that does not already carry it (product photos processed by Astro lose EXIF).
// Portraits already carry it from scripts/protect-images.mjs and are left untouched so their
// invisible watermark is not re-compressed.
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const YEAR = new Date().getFullYear();
const EXIF = {
  IFD0: {
    Copyright: `Copyright ${YEAR} Marilene Hodge. All rights reserved.`,
    Artist: 'Marilene Hodge',
    ImageDescription: 'Not licensed for AI training or reuse. Use requires written permission.',
  },
};

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

export default function ownership() {
  return {
    name: 'abundantly-ownership',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let n = 0;
        for await (const file of walk(root)) {
          const m = file.match(/\.(jpe?g|webp|avif|png)$/i);
          if (!m || file.includes('/brand/')) continue;
          const img = sharp(file);
          const meta = await img.metadata();
          if (meta.exif && meta.exif.includes('Marilene Hodge')) continue;
          const fmt = m[1].toLowerCase().replace('jpg', 'jpeg');
          const buf = await img[fmt]({ quality: 90 }).withExif(EXIF).toBuffer();
          await writeFile(file, buf);
          n++;
        }
        logger.info(`ownership data written to ${n} image(s)`);
      },
    },
  };
}
