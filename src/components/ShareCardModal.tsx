import { useRef, useEffect, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { OTTER_GLOW, SPLASH_FRAMES, SHARE_BG, LOGO_48 } from '../assets'
import { CARD_COLORS } from '../constants/emotions'
import type { CardData } from '../types'

type ShareCardModalProps = {
  card: CardData
  onClose: () => void
}

export function ShareCardModal({ card, onClose }: ShareCardModalProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const splashIdxRef = useRef(-1)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (splashIdxRef.current < 0) splashIdxRef.current = Math.floor(Math.random() * SPLASH_FRAMES.length)
    const splashPick = splashIdxRef.current
    const ctx = c.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const W = 750
    const H = 1100
    c.width = W * dpr
    c.height = H * dpr
    ctx.scale(dpr, dpr)

    const bg = new Image()
    bg.crossOrigin = 'anonymous'
    bg.src = SHARE_BG
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, W, H)

      const hero = new Image()
      hero.crossOrigin = 'anonymous'
      hero.src = SPLASH_FRAMES[splashPick]
      hero.onload = () => {
        const heroW = 480
        const heroH = 400
        const heroX = (W - heroW) / 2
        const heroY = 70
        const heroR = 24
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(heroX + heroR, heroY)
        ctx.lineTo(heroX + heroW - heroR, heroY)
        ctx.quadraticCurveTo(heroX + heroW, heroY, heroX + heroW, heroY + heroR)
        ctx.lineTo(heroX + heroW, heroY + heroH - heroR)
        ctx.quadraticCurveTo(heroX + heroW, heroY + heroH, heroX + heroW - heroR, heroY + heroH)
        ctx.lineTo(heroX + heroR, heroY + heroH)
        ctx.quadraticCurveTo(heroX, heroY + heroH, heroX, heroY + heroH - heroR)
        ctx.lineTo(heroX, heroY + heroR)
        ctx.quadraticCurveTo(heroX, heroY, heroX + heroR, heroY)
        ctx.closePath()
        ctx.clip()
        ctx.drawImage(hero, heroX, heroY, heroW, heroH)
        ctx.fillStyle = `${CARD_COLORS[card.word] || '#C8A882'}66`
        ctx.fillRect(heroX, heroY, heroW, heroH)
        ctx.restore()

        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 52px "PingFang SC",-apple-system,sans-serif'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.25)'
        ctx.shadowBlur = 8
        ctx.fillText(card.word, W / 2, heroY + heroH / 2 + 14)
        ctx.shadowBlur = 0

        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'
        logoImg.src = LOGO_48
        logoImg.onload = () => {
          ctx.save()
          ctx.globalAlpha = 0.7
          ctx.drawImage(logoImg, heroX + heroW - 56, heroY + 12, 40, 40)
          ctx.restore()

          const guideY = heroY + heroH + 44
          ctx.fillStyle = '#3C2E2B'
          ctx.font = '28px "PingFang SC",-apple-system,sans-serif'
          ctx.textAlign = 'center'
          const maxWidth = 560
          const guideText = card.guide
          const words = guideText.split('')
          let line = ''
          const lines: string[] = []
          for (const ch of words) {
            const test = line + ch
            if (ctx.measureText(test).width > maxWidth) {
              lines.push(line)
              line = ch
            } else {
              line = test
            }
          }
          if (line) lines.push(line)
          lines.forEach((l, i) => {
            ctx.fillText(l, W / 2, guideY + i * 44)
          })

          const moodY = guideY + lines.length * 44 + 40
          ctx.font = '22px "PingFang SC",-apple-system,sans-serif'
          ctx.fillStyle = '#8E7A72'
          ctx.fillText('觉察 · 念起', W / 2, moodY)

          const ot = new Image()
          ot.crossOrigin = 'anonymous'
          ot.src = OTTER_GLOW
          ot.onload = () => {
            const otY = Math.max(moodY + 50, H - 230)
            ctx.drawImage(ot, W / 2 - 50, otY, 100, 100)
            ctx.fillStyle = '#B8926C'
            ctx.font = 'bold 26px "PingFang SC",-apple-system,sans-serif'
            ctx.fillText('念起 · 觉察即自由', W / 2, otY + 130)
            ctx.fillStyle = '#8E7A72'
            ctx.font = '18px "PingFang SC",-apple-system,sans-serif'
            ctx.fillText('念念陪你每一次觉察', W / 2, otY + 160)
          }
        }
      }
    }
  }, [card])

  const handleShare = useCallback(async () => {
    const c = ref.current
    if (!c) return
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
      canShare?: (data: ShareData) => boolean
    }
    try {
      const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png'))
      if (blob && nav.share && nav.canShare?.({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
        const file = new File([blob], `念起觉察_${card.word}.png`, { type: 'image/png' })
        await nav.share({ title: `念起觉察 · ${card.word}`, files: [file] })
        return
      }
    } catch {
      // Share API not available or user cancelled — fall through to download
    }
    const a = document.createElement('a')
    a.download = `念起觉察_${card.word}.png`
    a.href = c.toDataURL('image/png')
    a.click()
  }, [card])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 420, margin: '0 auto', transform: 'translateY(0)', borderRadius: '28px 28px 0 0' }}
      >
        <div className="modal-title">
          <Sparkles size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {' '}
          分享你的觉察
        </div>
        <div style={{ background: '#FEF9F0', borderRadius: 20, padding: 16, marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
          <canvas ref={ref} style={{ width: '100%', maxWidth: 300, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} />
        </div>
        <button className="btn-save" onClick={handleShare}>保存到相册</button>
        <button className="btn-share" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}
