import { Heart } from 'lucide-react'
import { OTTER_DEFAULT } from '../../assets'

type HugModalProps = {
  message: string
  onClose: () => void
  onNextMessage: () => void
}

export function HugModal({ message, onClose, onNextMessage }: HugModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <img
            decoding="async"
            src={OTTER_DEFAULT}
            alt="念念"
            className="otter-round"
            style={{
              width: 110, height: 110, borderRadius: '50%',
              boxShadow: '0 0 40px rgba(255,229,180,0.7)', animation: 'otterFloat 3s ease-in-out infinite',
            }}
          />
        </div>
        <div className="modal-title">
          <Heart size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {' '}
          念念说：
        </div>
        <div className="hug-message">{message}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onNextMessage}>再听一句</button>
          <button className="btn-save" style={{ flex: 2 }} onClick={onClose}>谢谢念念 💛</button>
        </div>
      </div>
    </div>
  )
}
