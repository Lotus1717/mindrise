import { LOGO_48 } from '../assets'
import { CARD_COLORS, MOOD_EMOJI, MOOD_LABELS } from '../constants/emotions'
import { formatStatusDate } from '../homeUtils'
import type { ShareCardPayload } from '../types'

export const SHARE_CARD_W = 750
export const SHARE_CARD_H = 1050

const W = SHARE_CARD_W
const H = SHARE_CARD_H
const FONT = '"PingFang SC",-apple-system,sans-serif'

const C = {
  cream: '#FEF9F0',
  text: '#3C2E2B',
  muted: '#8E7A72',
  warm: '#E8B4A2',
  green: '#A7C5BD',
  gold: '#B8926C',
  quote: 'rgba(232,180,162,0.32)',
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** object-fit: cover — 保持比例裁剪，不拉伸 */
function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number, dy: number, dw: number, dh: number,
) {
  const nw = img.naturalWidth || img.width
  const nh = img.naturalHeight || img.height
  if (!nw || !nh) return
  const ir = nw / nh
  const dr = dw / dh
  let sx: number, sy: number, sw: number, sh: number
  if (ir > dr) {
    sh = nh
    sw = nh * dr
    sx = (nw - sw) / 2
    sy = 0
  } else {
    sw = nw
    sh = nw / dr
    sx = 0
    sy = (nh - sh) / 2
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh)
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const chars = [...text]
  const lines: string[] = []
  let line = ''
  for (const ch of chars) {
    const test = line + ch
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = ch
      if (lines.length >= maxLines) break
    } else {
      line = test
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length >= maxLines && lines[maxLines - 1]) {
    let last = lines[maxLines - 1]
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1)
    }
    lines[maxLines - 1] = `${last}…`
  }
  return lines
}

function drawBg(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, '#C8DFF0')
  g.addColorStop(0.32, '#EDE4F0')
  g.addColorStop(0.52, C.cream)
  g.addColorStop(1, C.cream)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
}

function drawPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save()
  ctx.shadowColor = 'rgba(60,46,43,0.10)'
  ctx.shadowBlur = 32
  ctx.shadowOffsetY = 10
  roundRect(ctx, x, y, w, h, 24)
  ctx.fillStyle = C.cream
  ctx.fill()
  ctx.restore()

  roundRect(ctx, x, y, w, h, 24)
  ctx.fillStyle = C.cream
  ctx.fill()

  ctx.save()
  roundRect(ctx, x, y, w, h, 24)
  ctx.clip()
  const bar = ctx.createLinearGradient(x, y, x + w, y)
  bar.addColorStop(0, C.warm)
  bar.addColorStop(1, C.green)
  ctx.fillStyle = bar
  ctx.fillRect(x, y, w, 5)
  ctx.restore()
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  dateLabel: string,
): number {
  const pad = 28
  ctx.textAlign = 'left'
  ctx.fillStyle = C.muted
  ctx.font = `24px ${FONT}`
  ctx.fillText(dateLabel, x + pad, y + 28)
  return y + 40
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  word: string,
  color: string,
  cardImg: HTMLImageElement,
): number {
  const pad = 28
  const imgW = w - pad * 2
  const imgH = Math.round(imgW * 10 / 16) // 与首页 card-visual 一致 16:10
  const imgX = x + pad

  ctx.save()
  roundRect(ctx, imgX, y, imgW, imgH, 16)
  ctx.clip()
  drawCoverImage(ctx, cardImg, imgX, y, imgW, imgH)
  const ov = ctx.createLinearGradient(imgX, y, imgX, y + imgH)
  ov.addColorStop(0, `${color}44`)
  ov.addColorStop(0.55, `${color}77`)
  ov.addColorStop(1, `${color}AA`)
  ctx.fillStyle = ov
  ctx.fillRect(imgX, y, imgW, imgH)
  ctx.restore()

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold 48px ${FONT}`
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.28)'
  ctx.shadowBlur = 8
  ctx.fillText(word, x + w / 2, y + imgH / 2 + 14)
  ctx.shadowBlur = 0
  return y + imgH + 20
}

function measureSummary(
  ctx: CanvasRenderingContext2D,
  summary: string,
  textW: number,
  maxLines: number,
) {
  ctx.font = `28px ${FONT}`
  const lines = wrapLines(ctx, summary, textW, maxLines)
  const lineH = 42
  const blockH = 32 + lines.length * lineH + 12
  return { lines, blockH, lineH }
}

function drawSummary(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  lines: string[],
  lineH: number,
): number {
  const pad = 28

  ctx.textAlign = 'center'
  ctx.fillStyle = C.warm
  ctx.font = `20px ${FONT}`
  ctx.fillText('—  这段觉察  —', x + w / 2, y + 22)

  const bodyY = y + 40
  ctx.fillStyle = C.quote
  ctx.font = `bold 48px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText('「', x + pad, bodyY + 30)

  ctx.fillStyle = C.text
  ctx.font = `28px ${FONT}`
  lines.forEach((line, i) => {
    ctx.textAlign = 'left'
    ctx.fillText(line, x + pad + 10, bodyY + 48 + i * lineH)
  })

  if (lines.length > 0) {
    const lastY = bodyY + 48 + (lines.length - 1) * lineH
    ctx.fillStyle = C.quote
    ctx.font = `bold 48px ${FONT}`
    ctx.textAlign = 'right'
    ctx.fillText('」', x + w - pad, lastY + 8)
  }

  return y + 32 + lines.length * lineH + 28
}

function drawMeta(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number,
  rating: number,
  tags: string[],
): number {
  const chips: string[] = []
  if (rating > 0) chips.push(`${MOOD_EMOJI[rating]} ${MOOD_LABELS[rating]}`)
  chips.push(...tags.slice(0, 3))
  if (chips.length === 0) return y

  ctx.font = `20px ${FONT}`
  const gap = 8
  const widths = chips.map(t => ctx.measureText(t).width + 24)
  const totalW = widths.reduce((s, pw) => s + pw, 0) + gap * (chips.length - 1)
  let tx = cx - totalW / 2

  for (let i = 0; i < chips.length; i++) {
    const pw = widths[i]
    roundRect(ctx, tx, y, pw, 32, 16)
    ctx.fillStyle = 'rgba(232,180,162,0.16)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(232,180,162,0.30)'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.fillStyle = '#8B5A3C'
    ctx.textAlign = 'center'
    ctx.fillText(chips[i], tx + pw / 2, y + 22)
    tx += pw + gap
  }
  return y + 32 + 16
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number,
  logoImg: HTMLImageElement,
) {
  ctx.strokeStyle = 'rgba(142,122,114,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x + 40, y)
  ctx.lineTo(x + w - 40, y)
  ctx.stroke()

  const logoSize = 48
  const gap = 14
  const name = '念起'
  const slogan = '觉察即自由'

  ctx.font = `bold 28px ${FONT}`
  const nameW = ctx.measureText(name).width
  ctx.font = `24px ${FONT}`
  const mid = ' · '
  const midW = ctx.measureText(mid).width
  const sloganW = ctx.measureText(slogan).width

  const rowW = logoSize + gap + nameW + midW + sloganW
  let cx = x + (w - rowW) / 2
  const cy = y + 52

  ctx.drawImage(logoImg, cx, cy - logoSize / 2, logoSize, logoSize)
  cx += logoSize + gap

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.text
  ctx.font = `bold 28px ${FONT}`
  ctx.fillText(name, cx, cy)
  cx += nameW

  ctx.fillStyle = C.muted
  ctx.font = `24px ${FONT}`
  ctx.fillText(mid, cx, cy)
  cx += midW
  ctx.fillText(slogan, cx, cy)
  ctx.textBaseline = 'alphabetic'
}

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  payload: ShareCardPayload,
): Promise<void> {
  const { card, summary, rating, tags, dateLabel } = payload
  const color = CARD_COLORS[card.word] || '#C8A882'
  const date = dateLabel ?? formatStatusDate()

  const ctx = canvas.getContext('2d')!
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const [cardImg, logoImg] = await Promise.all([
    loadImage(card.cardImg),
    loadImage(LOGO_48),
  ])

  const panelX = 32
  const panelY = 32
  const panelW = W - 64
  const panelH = H - 64
  const footerH = 88
  const textW = panelW - 56

  // 根据剩余空间决定小结行数，避免与底部重叠
  const heroH = Math.round((panelW - 56) * 10 / 16)
  const headerH = 40
  const reservedTop = headerH + heroH + 20
  const reservedBottom = footerH + 24
  const metaReserve = (rating > 0 || tags.length > 0) ? 48 : 0
  const summaryBudget = panelH - reservedTop - reservedBottom - metaReserve - 40
  const maxLines = Math.min(6, Math.max(3, Math.floor(summaryBudget / 42)))

  const { lines } = measureSummary(ctx, summary, textW, maxLines)

  drawBg(ctx)
  drawPanel(ctx, panelX, panelY, panelW, panelH)

  let y = panelY + 16
  y = drawHeader(ctx, panelX, y, date)
  y = drawHero(ctx, panelX, y, panelW, card.word, color, cardImg)
  y = drawSummary(ctx, panelX, y, panelW, lines, 42)
  y = drawMeta(ctx, panelX + panelW / 2, y, rating, tags)

  drawFooter(ctx, panelX, panelY + panelH - footerH, panelW, logoImg)
}
