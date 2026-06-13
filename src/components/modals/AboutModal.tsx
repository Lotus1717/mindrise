import { useCallback, useState } from 'react'
import { OTTER_GLOW } from '../../assets'
import { APP_SHARE_TEXT, ABOUT_BODY, ABOUT_DISCLAIMER } from '../../constants/legal'

type AboutModalProps = {
  onClose: () => void
}

export function AboutModal({ onClose }: AboutModalProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> }
    try {
      if (nav.share) {
        await nav.share({ title: '念起', text: APP_SHARE_TEXT })
        onClose()
        return
      }
    } catch {
      // user cancelled or share unavailable
    }
    try {
      await navigator.clipboard.writeText(APP_SHARE_TEXT)
      setCopied(true)
      setTimeout(onClose, 1200)
    } catch {
      setCopied(true)
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: '28px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img
            decoding="async"
            loading="lazy"
            src={OTTER_GLOW}
            alt="念起"
            className="otter-round"
            style={{
              width: 80, height: 80, borderRadius: '50%',
              boxShadow: '0 0 30px rgba(255,229,180,0.6)',
            }}
          />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 4 }}>念起</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 18 }}>MINDRISE · v1.0</div>
        <div style={{
          fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.9, textAlign: 'left',
          background: 'rgba(0,0,0,0.02)', borderRadius: 14, padding: '14px 16px', marginBottom: 18,
          whiteSpace: 'pre-line',
        }}
        >
          {ABOUT_BODY}
          {'\n\n'}
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{ABOUT_DISCLAIMER}</span>
        </div>
        <button type="button" className="btn-save" style={{ width: '100%' }} onClick={handleShare}>
          {copied ? '已复制 ✓' : '分享给朋友'}
        </button>
        <button type="button" className="btn-ghost-full" onClick={onClose}>关闭</button>
      </div>
    </div>
  )
}
