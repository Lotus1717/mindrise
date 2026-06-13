/**
 * 裁切 logo 源图：去掉棋盘格透明边距与外围阴影留白，再导出 PNG/WebP 与原生图标。
 * 运行: node scripts/fix-logo.mjs
 */
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOGO_DIR = join(__dirname, '..', 'public', 'logo')
const IOS_ICON_DIR = join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset')
const ANDROID_RES = join(__dirname, '..', 'android', 'app', 'src', 'main', 'res')

/** 设计工具导出的棋盘格假透明 */
function isCheckerboardGrey(r, g, b, a) {
  if (a < 16) return true
  return Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 85 && r < 220
}

/** 图标外围灰色投影 */
function isOuterShadow(r, g, b, a) {
  if (a < 16) return true
  return Math.abs(r - g) < 18 && Math.abs(g - b) < 18 && r < 130
}

function clearBgPixels(data) {
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += 4) {
    if (isCheckerboardGrey(out[i], out[i + 1], out[i + 2], out[i + 3])
      || isOuterShadow(out[i], out[i + 1], out[i + 2], out[i + 3])) {
      out[i + 3] = 0
    }
  }
  return out
}

async function cropLogoSquare(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const cleared = clearBgPixels(data)
  const trimmed = await sharp(cleared, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png()
    .toBuffer()

  const meta = await sharp(trimmed).metadata()
  const maxDim = Math.max(meta.width, meta.height)
  const padRatio = 0.04
  const pad = Math.round(maxDim * padRatio)
  const canvas = maxDim + pad * 2

  return sharp(trimmed)
    .extend({
      top: pad + Math.floor((maxDim - meta.height) / 2),
      bottom: pad + Math.ceil((maxDim - meta.height) / 2),
      left: pad + Math.floor((maxDim - meta.width) / 2),
      right: pad + Math.ceil((maxDim - meta.width) / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(canvas, canvas, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

async function trimSolidBg(input) {
  return sharp(input).trim({ threshold: 12 }).png().toBuffer()
}

async function writeLogoVariants(masterSquare) {
  const master1024 = await sharp(masterSquare).resize(1024, 1024).png().toFile(join(LOGO_DIR, 'logo-512.png'))
  void master1024

  await sharp(join(LOGO_DIR, 'logo-512.png')).resize(512, 512).webp({ quality: 82, effort: 4 }).toFile(join(LOGO_DIR, 'logo-512.webp'))
  await sharp(join(LOGO_DIR, 'logo-512.png')).resize(360, 360).png().toFile(join(LOGO_DIR, 'logo-180.png'))
  await sharp(join(LOGO_DIR, 'logo-180.png')).webp({ quality: 82, effort: 4 }).toFile(join(LOGO_DIR, 'logo-180.webp'))
  await sharp(join(LOGO_DIR, 'logo-512.png')).resize(96, 96).png().toFile(join(LOGO_DIR, 'logo-48.png'))
  await sharp(join(LOGO_DIR, 'logo-48.png')).webp({ quality: 85, effort: 4 }).toFile(join(LOGO_DIR, 'logo-48.webp'))
}

const IOS_ICONS = [
  ['AppIcon-20.png', 20],
  ['AppIcon-29.png', 29],
  ['AppIcon-40.png', 40],
  ['AppIcon-58.png', 58],
  ['AppIcon-60.png', 60],
  ['AppIcon-76.png', 76],
  ['AppIcon-80.png', 80],
  ['AppIcon-87.png', 87],
  ['AppIcon-120.png', 120],
  ['AppIcon-152.png', 152],
  ['AppIcon-167.png', 167],
  ['AppIcon-180.png', 180],
  ['AppIcon-512@2x.png', 1024],
]

const ANDROID_FOREGROUNDS = [
  ['mipmap-mdpi/ic_launcher_foreground.png', 108],
  ['mipmap-hdpi/ic_launcher_foreground.png', 162],
  ['mipmap-xhdpi/ic_launcher_foreground.png', 216],
  ['mipmap-xxhdpi/ic_launcher_foreground.png', 324],
  ['mipmap-xxxhdpi/ic_launcher_foreground.png', 432],
]

const ANDROID_LAUNCHERS = [
  ['mipmap-mdpi', 48],
  ['mipmap-hdpi', 72],
  ['mipmap-xhdpi', 96],
  ['mipmap-xxhdpi', 144],
  ['mipmap-xxxhdpi', 192],
]

async function writeNativeIcons(masterPath) {
  for (const [name, size] of IOS_ICONS) {
    await sharp(masterPath).resize(size, size).png().toFile(join(IOS_ICON_DIR, name))
  }

  const bg = { r: 0xc8, g: 0xa8, b: 0x82, alpha: 1 }
  for (const [rel, size] of ANDROID_FOREGROUNDS) {
    await sharp(masterPath).resize(size, size).png().toFile(join(ANDROID_RES, rel))
  }
  for (const [folder, size] of ANDROID_LAUNCHERS) {
    const fg = await sharp(masterPath).resize(size, size).png().toBuffer()
    const icon = await sharp({
      create: { width: size, height: size, channels: 4, background: bg },
    })
      .composite([{ input: fg, gravity: 'centre' }])
      .png()
      .toBuffer()
    await sharp(icon).toFile(join(ANDROID_RES, folder, 'ic_launcher.png'))
    await sharp(icon).toFile(join(ANDROID_RES, folder, 'ic_launcher_round.png'))
  }
}

async function main() {
  const master512 = join(LOGO_DIR, 'logo-512.png')
  let masterSquare

  try {
    masterSquare = await cropLogoSquare(master512)
    console.log('logo-512: cropped checkerboard/shadow margins')
  } catch {
    masterSquare = await trimSolidBg(master512)
    console.log('logo-512: trimmed solid background margins')
  }

  await writeLogoVariants(masterSquare)
  console.log('  → public/logo/logo-{48,180,512}.{png,webp}')

  await writeNativeIcons(join(LOGO_DIR, 'logo-512.png'))
  console.log('  → iOS AppIcon + Android launcher assets')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
