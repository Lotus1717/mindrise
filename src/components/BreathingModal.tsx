import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { OTTER_GLOW } from '../assets'

type Phase = 'inhale' | 'hold' | 'exhale'

const PHASE_DURATION = 4
const TOTAL_SECONDS = 30
const PHASES: Phase[] = ['inhale', 'hold', 'exhale']
const PHASE_LABELS: Record<Phase, string> = {
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
}

type BreathingModalProps = {
  onClose: () => void
}

export function BreathingModal({ onClose }: BreathingModalProps) {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [phaseCount, setPhaseCount] = useState(PHASE_DURATION)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const phase = PHASES[phaseIdx % PHASES.length]

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(tickRef.current!)
          return 0
        }
        return r - 1
      })
      setPhaseCount(c => {
        if (c <= 1) {
          setPhaseIdx(i => i + 1)
          return PHASE_DURATION
        }
        return c - 1
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  useEffect(() => {
    if (remaining === 0) {
      const id = setTimeout(onClose, 1200)
      return () => clearTimeout(id)
    }
  }, [remaining, onClose])

  const otterScale = phase === 'inhale' ? 1.12 : phase === 'exhale' ? 0.92 : 1.0
  const ringScale = phase === 'inhale' ? 1.25 : phase === 'exhale' ? 0.85 : 1.05

  return (
    <div className="modal-overlay" style={{ alignItems: 'center' }} onClick={onClose}>
      <div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: 28, maxWidth: 360, margin: '0 auto', textAlign: 'center',
          transform: 'translateY(0)', paddingBottom: 32,
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭"
          style={{
            position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,0.06)',
            border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
          }}
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div className="modal-title" style={{ marginTop: 8 }}>跟着念念呼吸</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>4-4-4 节奏 · 共 30 秒</div>

        <div style={{ position: 'relative', width: 180, height: 180, margin: '0 auto 24px' }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,197,189,0.35), transparent 70%)',
            transform: `scale(${ringScale})`,
            transition: 'transform 4s ease-in-out',
          }}
          />
          <img
            src={OTTER_GLOW}
            alt="念念"
            className="otter-round"
            decoding="async"
            style={{
              width: 140, height: 140, borderRadius: '50%',
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%, -50%) scale(${otterScale})`,
              transition: 'transform 4s ease-in-out',
              boxShadow: '0 0 40px rgba(255,229,180,0.6)',
            }}
          />
        </div>

        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 8 }}>
          {remaining > 0 ? PHASE_LABELS[phase] : '完成 ✨'}
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--accent-warm)', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
          {remaining > 0 ? phaseCount : '0'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {remaining > 0 ? `剩余 ${remaining} 秒` : '感觉有没有轻松一点？'}
        </div>
      </div>
    </div>
  )
}
