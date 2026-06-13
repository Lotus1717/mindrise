/**
 * otter-glow：棋盘格/透明底 → 暖色实底（与 otter-happy 一致），输出 RGB PNG + WebP。
 * 运行: node scripts/fix-otter-glow.mjs
 */
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PNG = join(__dirname, '..', 'public', 'otter-frames', 'otter-glow.png')
const WEBP = join(__dirname, '..', 'public', 'otter-frames', 'otter-glow.webp')

/** 棋盘格灰底（R≈G≈B），设计工具「假透明」常见 */
function isCheckerboardGrey(r, g, b, a) {
  if (a < 16) return true
  return Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 85 && r < 220
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

/** 圆形暖色底，与 index.css .otter-round 一致 */
function warmBgAt(x, y, w, h) {
  const cx = (w - 1) / 2
  const cy = (h - 1) / 2
  const maxR = Math.hypot(cx, cy)
  const d = Math.min(1, Math.hypot(x - cx, y - cy) / maxR)
  // #FFF8F0 → #FEF9F0 → #EDE6DC
  const inner = [255, 248, 240]
  const outer = [237, 230, 220]
  const t = d * d
  return [
    lerp(inner[0], outer[0], t),
    lerp(inner[1], outer[1], t),
    lerp(inner[2], outer[2], t),
  ]
}

async function main() {
  const { data, info } = await sharp(PNG).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.alloc(info.width * info.height * 3)
  let filled = 0

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const si = (y * info.width + x) * 4
      const di = (y * info.width + x) * 3
      const r = data[si]
      const g = data[si + 1]
      const b = data[si + 2]
      const a = data[si + 3]
      const [br, bg, bb] = warmBgAt(x, y, info.width, info.height)

      if (isCheckerboardGrey(r, g, b, a)) {
        out[di] = br
        out[di + 1] = bg
        out[di + 2] = bb
        filled++
      } else if (a < 255) {
        const t = a / 255
        out[di] = lerp(br, r, t)
        out[di + 1] = lerp(bg, g, t)
        out[di + 2] = lerp(bb, b, t)
        filled++
      } else {
        out[di] = r
        out[di + 1] = g
        out[di + 2] = b
      }
    }
  }

  const baked = sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } })

  await baked.clone().png({ compressionLevel: 9 }).toFile(PNG)
  await baked.clone().resize({ width: 256 }).webp({ quality: 85, effort: 4 }).toFile(WEBP)

  console.log(`otter-glow: ${info.width}×${info.height} → filled ${filled} bg pixels with warm solid`)
  console.log(`  PNG (RGB): ${PNG}`)
  console.log(`  WebP 256px: ${WEBP}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
