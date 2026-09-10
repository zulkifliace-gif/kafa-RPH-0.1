import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('./KAFA MADRASAH AS-SOBIRIN.svg');
const svgBuffer = fs.readFileSync(svgPath);

// Ensure directories exist
fs.mkdirSync('./public/icons', { recursive: true });
fs.mkdirSync('./resources/android/mipmap-mdpi', { recursive: true });
fs.mkdirSync('./resources/android/mipmap-hdpi', { recursive: true });
fs.mkdirSync('./resources/android/mipmap-xhdpi', { recursive: true });
fs.mkdirSync('./resources/android/mipmap-xxhdpi', { recursive: true });
fs.mkdirSync('./resources/android/mipmap-xxxhdpi', { recursive: true });

// Copy SVG to public as favicon.svg
fs.writeFileSync('./public/favicon.svg', svgBuffer);
console.log('✓ public/favicon.svg created');

// Standard icon sizes
const iconSizes = [
  { file: './public/favicon-16x16.png', size: 16 },
  { file: './public/favicon-32x32.png', size: 32 },
  { file: './public/apple-touch-icon.png', size: 180 },
  { file: './public/icon-192.png', size: 192 },
  { file: './public/icon-512.png', size: 512 },
  { file: './public/icons/icon-48x48.png', size: 48 },
  { file: './public/icons/icon-72x72.png', size: 72 },
  { file: './public/icons/icon-96x96.png', size: 96 },
  { file: './public/icons/icon-128x128.png', size: 128 },
  { file: './public/icons/icon-144x144.png', size: 144 },
  { file: './public/icons/icon-192x192.png', size: 192 },
  { file: './public/icons/icon-384x384.png', size: 384 },
  { file: './public/icons/icon-512x512.png', size: 512 },
  // Android native mipmap sizes for APK
  { file: './resources/android/mipmap-mdpi/ic_launcher.png', size: 48 },
  { file: './resources/android/mipmap-hdpi/ic_launcher.png', size: 72 },
  { file: './resources/android/mipmap-xhdpi/ic_launcher.png', size: 96 },
  { file: './resources/android/mipmap-xxhdpi/ic_launcher.png', size: 144 },
  { file: './resources/android/mipmap-xxxhdpi/ic_launcher.png', size: 192 },
  { file: './resources/icon.png', size: 1024 }
];

async function generateAll() {
  for (const item of iconSizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(item.file);
    console.log(`✓ Generated ${item.file} (${item.size}x${item.size})`);
  }

  // Generate Maskable Icons for Android PWA (adding 10% safe margin)
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.8);
    const innerBuffer = await sharp(svgBuffer)
      .resize(innerSize, innerSize)
      .png()
      .toBuffer();

    const maskableFile = `./public/icons/icon-maskable-${size}x${size}.png`;
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite([{ input: innerBuffer, gravity: 'center' }])
      .png()
      .toFile(maskableFile);

    console.log(`✓ Generated maskable icon ${maskableFile}`);
  }

  // Also create public/favicon.ico
  const icoBuffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync('./public/favicon.ico', icoBuffer);
  console.log('✓ public/favicon.ico created');
}

generateAll().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
