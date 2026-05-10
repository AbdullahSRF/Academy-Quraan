/**
 * يولّد صور splash لـ iOS (PNG) من تدرّج وهوية بسيطة.
 * التشغيل: node scripts/generate-apple-splash.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const outDir = path.join(process.cwd(), "public", "splash");
fs.mkdirSync(outDir, { recursive: true });

/** عرض × ارتفاع (عمودي) — مجموعة شائعة لأجهزة Apple الحديثة */
const sizes = [
  [1290, 2796],
  [1284, 2778],
  [1179, 2556],
  [1170, 2532],
  [1125, 2436],
  [828, 1792],
  [1242, 2688],
  [1668, 2388],
  [2048, 2732],
];

function svgFor(w, h) {
  const title = "أكاديمية التحفيظ";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#047857"/>
      <stop offset="100%" style="stop-color:#022c22"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="46%" text-anchor="middle" fill="#ecfdf5" font-family="Arial, Tahoma, sans-serif" font-size="${Math.round(
    Math.min(w, h) * 0.055,
  )}" font-weight="700">${title}</text>
  <text x="50%" y="54%" text-anchor="middle" fill="#a7f3d0" font-family="Arial, Tahoma, sans-serif" font-size="${Math.round(
    Math.min(w, h) * 0.028,
  )}" font-weight="600">تحفيظ القرآن</text>
</svg>`;
}

for (const [w, h] of sizes) {
  const file = path.join(outDir, `${w}x${h}.png`);
  const buf = Buffer.from(svgFor(w, h));
  await sharp(buf).png({ compressionLevel: 9 }).resize(w, h).toFile(file);
  console.log("wrote", path.relative(process.cwd(), file));
}

console.log("Done. روابط الـ media في src/components/pwa/apple-splash-links.tsx");
