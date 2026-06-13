/**
 * 将 public/ 下的 PNG 转为 WebP，按实际显示尺寸压缩。
 * 运行: node scripts/optimize-images.mjs
 */
import sharp from 'sharp'
import { readdir, stat } from 'node:fs/promises'
import { join, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')

function ruleFor(relPath) {
  const name = basename(relPath)
  if (relPath.startsWith('cards/')) return { maxWidth: 640, quality: 82 }
  if (name.startsWith('splash-') || name.startsWith('frame-')) return { maxWidth: 400, quality: 82 }
  if (name.startsWith('otter-')) return { maxWidth: 256, quality: 82 }
  if (name.startsWith('onboard-')) return { maxWidth: 720, quality: 82 }
  if (name.startsWith('share-bg')) return { maxWidth: 800, quality: 80 }
  if (name.startsWith('logo-48')) return { maxWidth: 96, quality: 85 }
  if (name.startsWith('logo-180')) return { maxWidth: 360, quality: 82 }
  if (name.startsWith('logo-512')) return { maxWidth: 512, quality: 82 }
  return { maxWidth: 800, quality: 82 }
}

async function walk(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...await walk(full, rel))
    else if (/\.(png|jpe?g)$/i.test(e.name)) files.push({ rel, full })
  }
  return files
}

async function convertOne({ rel, full }) {
  const out = full.replace(/\.(png|jpe?g)$/i, '.webp')
  const cfg = ruleFor(rel)
  const meta = await sharp(full).metadata()
  const w = meta.width ?? cfg.maxWidth
  const resize = w > cfg.maxWidth ? { width: cfg.maxWidth } : undefined

  const pipeline = rel.startsWith('cards/')
    ? sharp(full).trim({ threshold: 12 }).resize(640, 857, { fit: 'cover', position: 'centre' })
    : sharp(full).resize(resize)

  await pipeline
    .webp({ quality: cfg.quality, effort: 4 })
    .toFile(out)

  const [srcSize, dstSize] = await Promise.all([stat(full), stat(out)])
  const saved = ((1 - dstSize.size / srcSize.size) * 100).toFixed(0)
  console.log(`  ${rel} → ${basename(out)}  ${(srcSize.size/1024).toFixed(0)}KB → ${(dstSize.size/1024).toFixed(0)}KB (-${saved}%)`)

  // cards/ 与 otter-frames/ 仅保留 WebP，避免 dist 重复打包
  if (rel.startsWith('cards/') || rel.startsWith('otter-frames/')) {
    const { unlink } = await import('node:fs/promises')
    await unlink(full)
  }

  return { rel, saved: srcSize.size - dstSize.size }
}

async function main() {
  console.log('Optimizing images in public/ …\n')
  const files = await walk(PUBLIC)
  let totalSaved = 0
  for (const f of files) {
    const r = await convertOne(f)
    totalSaved += r.saved
  }
  console.log(`\nDone. ${files.length} files, saved ~${(totalSaved / 1024 / 1024).toFixed(1)} MB`)
}

main().catch(err => { console.error(err); process.exit(1) })
