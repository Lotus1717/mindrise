import { PRIVACY_POLICY } from '../../constants/legal'

type PrivacyModalProps = {
  onClose: () => void
}

export function PrivacyModal({ onClose }: PrivacyModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
        <div className="modal-title">隐私政策</div>
        <div style={{
          fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.9, whiteSpace: 'pre-line',
          background: 'rgba(0,0,0,0.02)', borderRadius: 14, padding: '14px 16px', marginBottom: 18,
        }}
        >
          {PRIVACY_POLICY}
        </div>
        <button className="btn-save" onClick={onClose}>知道了</button>
      </div>
    </div>
  )
}
