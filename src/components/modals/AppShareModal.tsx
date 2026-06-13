import { useCallback, useState } from 'react'
import { Share2 } from 'lucide-react'
import { APP_SHARE_TEXT } from '../../constants/legal'

type AppShareModalProps = {
  onClose: () => void
}

export function AppShareModal({ onClose }: AppShareModalProps) {
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
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div className="modal-title">
          <Share2 size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {' '}
          分享念起
        </div>
        <div style={{
          fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.8,
          background: 'rgba(232,180,162,0.1)', borderRadius: 16, padding: 16, marginBottom: 20,
        }}
        >
          {APP_SHARE_TEXT}
        </div>
        <button className="btn-save" onClick={handleShare}>
          {copied ? '已复制 ✓' : '分享给朋友'}
        </button>
        <button className="btn-share" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}
