import { OTTER_GLOW } from '../../assets'

type AboutModalProps = {
  onClose: () => void
}

export function AboutModal({ onClose }: AboutModalProps) {
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
        }}
        >
          一只叫念念的小水獭，陪你看见情绪的形状。
          <br />
          我们相信，每一次觉察，都是一次温柔的自我靠近。
          <br />
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>「念起」不替代专业心理咨询。如有严重困扰，请寻求专业帮助。</span>
        </div>
        <button className="btn-save" style={{ width: '100%' }} onClick={onClose}>知道了</button>
      </div>
    </div>
  )
}
