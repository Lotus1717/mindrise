import { useRef, useEffect, useCallback, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { drawShareCard, SHARE_CARD_H, SHARE_CARD_W } from '../utils/shareCardCanvas'
import type { ShareCardPayload } from '../types'

type ShareCardModalProps = {
  payload: ShareCardPayload
  onClose: () => void
}

export function ShareCardModal({ payload, onClose }: ShareCardModalProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [cardH, setCardH] = useState(SHARE_CARD_H)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    setReady(false)
    setError(false)
    drawShareCard(c, payload)
      .then(h => { setCardH(h); setReady(true) })
      .catch(() => setError(true))
  }, [payload])

  const handleShare = useCallback(async () => {
    const c = ref.current
    if (!c || !ready) return
    const { card } = payload
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
      canShare?: (data: ShareData) => boolean
    }
    try {
      const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png'))
      if (!blob) throw new Error('canvas empty')
      const file = new File([blob], `念起觉察_${card.word}.png`, { type: 'image/png' })
      // iOS：title/text 与 files 同传会拆成「一张图 + 一段文字」，只传 files
      const shareData: ShareData = { files: [file] }
      if (nav.share && nav.canShare?.(shareData)) {
        await nav.share(shareData)
        return
      }
    } catch {
      // Share API not available or user cancelled — fall through to download
    }
    const a = document.createElement('a')
    a.download = `念起觉察_${card.word}.png`
    a.href = c.toDataURL('image/png')
    a.click()
  }, [payload, ready])

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
        <p className="modal-subtitle" style={{ marginBottom: 16 }}>
          保存到相册，或分享给朋友
        </p>
        <div style={{
          background: '#FEF9F0', borderRadius: 20, padding: 16, marginBottom: 16,
          display: 'flex', justifyContent: 'center', minHeight: 200,
        }}
        >
          {error ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: 40, textAlign: 'center' }}>
              卡片生成失败，请稍后再试
            </div>
          ) : (
            <canvas
              ref={ref}
              style={{
                width: '100%',
                maxWidth: 300,
                aspectRatio: `${SHARE_CARD_W} / ${cardH}`,
                height: 'auto',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                opacity: ready ? 1 : 0.4,
                transition: 'opacity 0.3s',
              }}
            />
          )}
        </div>
        <button className="btn-save" onClick={handleShare} disabled={!ready || error}>
          {ready ? '保存 / 分享' : '生成中…'}
        </button>
        <button className="btn-share" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}
