import { OTTER_DEFAULT } from '../../assets'

type HugModalProps = {
  message: string
  loading: boolean
  onClose: () => void
  onNextMessage: () => void
}

export function HugModal({ message, loading, onClose, onNextMessage }: HugModalProps) {
  const busy = loading || !message

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
        <div className={`hug-message${loading && !message ? ' hug-message--loading' : ''}`}>
          {loading && !message ? (
            <div className="typing-indicator hug-typing">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          ) : message}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn-ghost"
            style={{ flex: 1 }}
            disabled={busy}
            onClick={onNextMessage}
          >
            再听一句
          </button>
          <button type="button" className="btn-save" style={{ flex: 2 }} onClick={onClose}>谢谢念念 💛</button>
        </div>
      </div>
    </div>
  )
}
