/*
  Usage: node scripts/generate-android-icons.js icon.jpeg
  Requires: npm i -D sharp
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const input = process.argv[2] || 'icon.jpeg';
const resDir = path.resolve(__dirname, '../android/app/src/main/res');
const targets = [
  { dir: 'mipmap-mdpi', size: 108 },
  { dir: 'mipmap-hdpi', size: 162 },
  { dir: 'mipmap-xhdpi', size: 216 },
  { dir: 'mipmap-xxhdpi', size: 324 },
  { dir: 'mipmap-xxxhdpi', size: 432 },
];

(async () => {
  try {
    for (const t of targets) {
      const outPath = path.join(resDir, t.dir, 'shade_launcher_foreground.png');
      await sharp(input)
        .resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outPath);
      console.log('wrote', outPath);
    }
  } catch (e) {
    console.error('Failed generating android icons:', e);
    process.exit(1);
  }
})();


