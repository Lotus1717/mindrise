import { Phone } from 'lucide-react'
import { CRISIS_HOTLINES, DISCLAIMER } from '../../constants/legal'

type CrisisModalProps = {
  onClose: () => void
}

export function CrisisModal({ onClose }: CrisisModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">需要帮助</div>
        <div style={{
          fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 16,
          background: 'rgba(232,180,162,0.1)', borderRadius: 14, padding: '12px 14px',
        }}
        >
          {DISCLAIMER}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {CRISIS_HOTLINES.map(h => (
            <a
              key={h.number}
              href={`tel:${h.number.replace(/-/g, '')}`}
              className="profile-list-item"
              style={{
                textDecoration: 'none', borderRadius: 16, border: '1px solid var(--card-border, #F5EDE3)',
                margin: 0,
              }}
            >
              <div className="list-icon"><Phone size={18} strokeWidth={2} /></div>
              <div style={{ flex: 1 }}>
                <div className="list-label">{h.name}</div>
                <div style={{ fontSize: 12, color: 'var(--accent-warm)', marginTop: 2 }}>{h.number} · {h.note}</div>
              </div>
              <div className="list-arrow">›</div>
            </a>
          ))}
        </div>
        <button className="btn-save" onClick={onClose}>关闭</button>
      </div>
    </div>
  )
}
