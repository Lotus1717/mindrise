import { LOGO_48 } from '../assets'
import { CARD_COLORS, MOOD_EMOJI, MOOD_LABELS } from '../constants/emotions'
import { formatStatusDate } from '../homeUtils'
import type { ShareCardPayload } from '../types'

export const SHARE_CARD_W = 750
export const SHARE_CARD_H = 960

const W = SHARE_CARD_W
const FONT = '"PingFang SC",-apple-system,sans-serif'
const PAD = 52

const CARD_VISUAL_W = Math.round(334 * (W / 430) * 0.78)
const CARD_VISUAL_H = Math.round(CARD_VISUAL_W * 10 / 16)
const CARD_RADIUS = 14

const SUMMARY_FONT = 30
const SUMMARY_LINE_H = 48
const SUMMARY_BLOCK_PAD_X = 36
const SUMMARY_BLOCK_PAD_Y = 28

const GAP_AFTER_HERO = 28
const GAP_BEFORE_FOOTER = 36
const FOOTER_BLOCK_H = 52

const C = {
  cream: '#FEF9F0',
  text: '#3C2E2B',
  muted: '#8E7A72',
  block: 'rgba(232,180,162,0.07)',
  blockBorder: 'rgba(232,180,162,0.14)',
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

function fillTextSpaced(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number, y: number,
  spacing: number,
) {
  const prevAlign = ctx.textAlign
  ctx.textAlign = 'left'
  const chars = [...text]
  let totalW = 0
  for (const ch of chars) totalW += ctx.measureText(ch).width
  totalW += spacing * Math.max(0, chars.length - 1)
  let x = cx - totalW / 2
  for (const ch of chars) {
    ctx.fillText(ch, x, y)
    x += ctx.measureText(ch).width + spacing
  }
  ctx.textAlign = prevAlign
}

function measureLayout(
  ctx: CanvasRenderingContext2D,
  summary: string,
  innerTextW: number,
  hasMeta: boolean,
) {
  ctx.font = `${SUMMARY_FONT}px ${FONT}`
  const lines = wrapLines(ctx, summary, innerTextW, 5)
  const blockH = SUMMARY_BLOCK_PAD_Y + lines.length * SUMMARY_LINE_H + SUMMARY_BLOCK_PAD_Y

  let y = PAD + 56
  y += CARD_VISUAL_H + 32
  y += GAP_AFTER_HERO
  y += blockH
  if (hasMeta) y += 24 + 22
  const footerGap = lines.length <= 2 ? 28 : GAP_BEFORE_FOOTER
  y += footerGap

  return { lines, blockH, footerY: y, totalH: y + FOOTER_BLOCK_H + PAD }
}

function drawBg(ctx: CanvasRenderingContext2D, h: number) {
  ctx.fillStyle = C.cream
  ctx.fillRect(0, 0, W, h)
  const g = ctx.createLinearGradient(0, 0, 0, Math.min(h, 520))
  g.addColorStop(0, '#D8E8F4')
  g.addColorStop(0.55, '#F3ECF4')
  g.addColorStop(1, 'rgba(254,249,240,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, h)
}

function drawDate(ctx: CanvasRenderingContext2D, cx: number, y: number, date: string) {
  ctx.textAlign = 'center'
  ctx.fillStyle = C.muted
  ctx.font = `20px ${FONT}`
  ctx.fillText(date, cx, y)
}

function drawHero(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number,
  word: string,
  color: string,
  cardImg: HTMLImageElement,
): number {
  const imgW = CARD_VISUAL_W
  const imgH = CARD_VISUAL_H
  const imgX = cx - imgW / 2

  ctx.save()
  ctx.shadowColor = 'rgba(60,46,43,0.10)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 10
  roundRect(ctx, imgX, y, imgW, imgH, CARD_RADIUS)
  ctx.fillStyle = '#FFF'
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundRect(ctx, imgX, y, imgW, imgH, CARD_RADIUS)
  ctx.clip()
  drawCoverImage(ctx, cardImg, imgX, y, imgW, imgH)
  const ov = ctx.createLinearGradient(imgX, y, imgX + imgW, y + imgH)
  ov.addColorStop(0, `${color}88`)
  ov.addColorStop(0.5, `${color}55`)
  ov.addColorStop(1, `${color}88`)
  ctx.fillStyle = ov
  ctx.fillRect(imgX, y, imgW, imgH)

  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold 40px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = 6
  const spacing = word.length <= 2 ? 10 : 4
  fillTextSpaced(ctx, word, cx, y + imgH / 2, spacing)
  ctx.shadowBlur = 0
  ctx.textBaseline = 'alphabetic'
  ctx.restore()

  return y + imgH + 32
}

function drawSummary(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number,
  lines: string[],
  blockH: number,
): number {
  const blockW = W - PAD * 2
  const blockX = cx - blockW / 2

  roundRect(ctx, blockX, y, blockW, blockH, 18)
  ctx.fillStyle = C.block
  ctx.fill()
  ctx.strokeStyle = C.blockBorder
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = C.text
  ctx.font = `${SUMMARY_FONT}px ${FONT}`
  ctx.textAlign = 'center'
  const bodyY = y + SUMMARY_BLOCK_PAD_Y + 36
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, bodyY + i * SUMMARY_LINE_H)
  })

  return y + blockH
}

function drawMeta(
  ctx: CanvasRenderingContext2D,
  cx: number, y: number,
  rating: number,
  tags: string[],
): number {
  const parts: string[] = []
  if (rating > 0) parts.push(`${MOOD_EMOJI[rating]} ${MOOD_LABELS[rating]}`)
  parts.push(...tags.slice(0, 2))
  if (parts.length === 0) return y

  ctx.textAlign = 'center'
  ctx.fillStyle = C.muted
  ctx.globalAlpha = 0.82
  ctx.font = `18px ${FONT}`
  ctx.fillText(parts.join('  ·  '), cx, y)
  ctx.globalAlpha = 1
  return y + 22
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  y: number,
  logoImg: HTMLImageElement,
) {
  const cx = W / 2
  const logoSize = 36
  const gap = 10
  const brandText = '念起 · 觉察即自由'

  ctx.font = `20px ${FONT}`
  const textW = ctx.measureText(brandText).width
  const rowW = logoSize + gap + textW
  let left = cx - rowW / 2
  const rowY = y + 32

  ctx.save()
  ctx.beginPath()
  ctx.arc(left + logoSize / 2, rowY, logoSize / 2 + 4, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,229,180,0.28)'
  ctx.fill()
  ctx.drawImage(logoImg, left, rowY - logoSize / 2, logoSize, logoSize)
  ctx.restore()

  left += logoSize + gap
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = C.muted
  ctx.font = `20px ${FONT}`
  ctx.fillText(brandText, left, rowY)
  ctx.textBaseline = 'alphabetic'
}

export async function drawShareCard(
  canvas: HTMLCanvasElement,
  payload: ShareCardPayload,
): Promise<number> {
  const { card, summary, rating, tags, dateLabel } = payload
  const color = CARD_COLORS[card.word] || '#C8A882'
  const date = dateLabel ?? formatStatusDate()
  const cx = W / 2
  const hasMeta = rating > 0 || tags.length > 0
  const innerTextW = W - PAD * 2 - SUMMARY_BLOCK_PAD_X * 2

  const measureCtx = canvas.getContext('2d')!
  const { lines, blockH, footerY, totalH } = measureLayout(measureCtx, summary, innerTextW, hasMeta)

  const ctx = canvas.getContext('2d')!
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  canvas.width = W * dpr
  canvas.height = totalH * dpr
  ctx.scale(dpr, dpr)

  const [cardImg, logoImg] = await Promise.all([
    loadImage(card.cardImg),
    loadImage(LOGO_48),
  ])

  drawBg(ctx, totalH)

  let y = PAD + 12
  drawDate(ctx, cx, y, date)
  y += 44

  y = drawHero(ctx, cx, y, card.word, color, cardImg)
  y += GAP_AFTER_HERO

  y = drawSummary(ctx, cx, y, lines, blockH)

  if (hasMeta) {
    y += 24
    drawMeta(ctx, cx, y, rating, tags)
  }

  drawFooter(ctx, footerY, logoImg)
  return totalH
}
