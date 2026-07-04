/** One-off asset pipeline: brand PNGs -> resized WebP (run: node scripts/optimize-images.mjs). */
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const IMG_DIR = fileURLToPath(new URL('../public/img/', import.meta.url))
const TARGET_WIDTH = 1600
const WEBP_QUALITY = 78

const files = (await readdir(IMG_DIR)).filter((file) => file.endsWith('.png'))

for (const file of files) {
  const source = path.join(IMG_DIR, file)
  const target = source.replace(/\.png$/, '.webp')
  const info = await sharp(source)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toFile(target)
  console.log(`${file} -> ${path.basename(target)} (${Math.round(info.size / 1024)} kB)`)
}
