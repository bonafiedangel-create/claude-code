// Check whether an image file carries the Abundantly / Marilène Hodge watermark.
//   npm run watermark:check -- path/to/suspect-image.jpg
// Works on copies saved straight from the site (same size). A 90%+ match is proof it came from us.
import sharp from 'sharp';
import { read } from './watermark.mjs';

const file = process.argv[2];
if (!file) {
  console.log('Usage: npm run watermark:check -- path/to/image');
  process.exit(1);
}
const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { match } = read(data, info.width, info.height, info.channels);
const meta = await sharp(file).metadata();
console.log(
  `Watermark match: ${(match * 100).toFixed(0)}%  (${match >= 0.9 ? 'YES, this is our image' : match >= 0.75 ? 'likely ours, image was altered' : 'not detected'})`,
);
if (meta.exif) console.log('EXIF ownership data is present.');
