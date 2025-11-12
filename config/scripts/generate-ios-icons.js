/*
  Usage: node scripts/generate-ios-icons.js [path-to-icon]
  Requires: npm i -D sharp
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const input =
  process.argv[2] || path.resolve(__dirname, '../assets/icon/shade_app_icon.png');
const outDir = path.resolve(__dirname, '../ios/capsule/Images.xcassets/AppIcon.appiconset');

const targets = [
  { idiom: 'iphone', size: 20, scales: [2,3] },
  { idiom: 'iphone', size: 29, scales: [2,3] },
  { idiom: 'iphone', size: 40, scales: [2,3] },
  { idiom: 'iphone', size: 60, scales: [2,3] },
  { idiom: 'ios-marketing', size: 1024, scales: [1] },
];

(async () => {
  try {
    const contentsPath = path.join(outDir, 'Contents.json');
    const contents = JSON.parse(fs.readFileSync(contentsPath, 'utf8'));
    let index = 0;
    for (const t of contents.images) {
      const size = parseInt(String(t.size).split('x')[0], 10);
      const scale = parseInt(String(t.scale).replace('x',''), 10);
      const px = size * scale;
      const filename = `shade_${size}x${size}@${scale}x.png`;
      t.filename = filename;
      const out = path.join(outDir, filename);
      // Add rounded corners (22.5% of size approximates iOS icon squircle nicely)
      const radius = Math.round(px * 0.225);
      const rounded = Buffer.from(
        `<svg width="${px}" height="${px}" xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="${px}" height="${px}" rx="${radius}" ry="${radius}" fill="#0B0F14"/>
        </svg>`
      );
      const base = await sharp(rounded).png().toBuffer();
      await sharp(base)
        .composite([{ input: input, gravity: 'center' }])
        .resize(px, px)
        .png()
        .toFile(out);
      console.log(`[${++index}] ${size}pt @${scale}x →`, filename);
    }
    fs.writeFileSync(contentsPath, JSON.stringify(contents, null, 2));
    console.log('Updated Contents.json with filenames.');
  } catch (e) {
    console.error('Failed generating icons:', e);
    process.exit(1);
  }
})();
