import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Volume2, VolumeX } from 'lucide-react'
import { OTTER_GLOW } from '../assets'
import { BreathingAudio } from '../utils/breathingAudio'

type Phase = 'inhale' | 'hold' | 'exhale'

const PHASE_DURATION = 4
const TOTAL_SECONDS = 30
const PHASES: Phase[] = ['inhale', 'hold', 'exhale']
const PHASE_LABELS: Record<Phase, string> = {
  inhale: '吸气',
  hold: '屏息',
  exhale: '呼气',
}
const PHASE_HINTS: Record<Phase, string> = {
  inhale: '慢慢填满胸腔',
  hold: '轻轻停在这里',
  exhale: '让肩膀松下来',
}

const RING_R = 86
const RING_C = 2 * Math.PI * RING_R

type BreathingModalProps = {
  onClose: () => void
}

export function BreathingModal({ onClose }: BreathingModalProps) {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [phaseCount, setPhaseCount] = useState(PHASE_DURATION)
  const [soundOn, setSoundOn] = useState(true)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<BreathingAudio | null>(null)

  const phase = PHASES[phaseIdx % PHASES.length]
  const done = remaining === 0

  useEffect(() => {
    const audio = new BreathingAudio()
    audioRef.current = audio
    audio.start().catch(() => {
      setSoundOn(false)
    })
    return () => {
      audio.stop()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    audioRef.current?.setMuted(!soundOn)
  }, [soundOn])

  useEffect(() => {
    if (done) return
    audioRef.current?.pulsePhase(phase)
  }, [phaseIdx, done, phase])

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (tickRef.current) clearInterval(tickRef.current)
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
    if (!done) return
    const id = setTimeout(onClose, 1600)
    return () => clearTimeout(id)
  }, [done, onClose])

  const handleClose = useCallback(() => {
    audioRef.current?.stop()
    onClose()
  }, [onClose])

  const otterScale = phase === 'inhale' ? 1.12 : phase === 'exhale' ? 0.92 : 1.0
  const ringScale = phase === 'inhale' ? 1.22 : phase === 'exhale' ? 0.88 : 1.04
  const progress = remaining / TOTAL_SECONDS

  return (
    <div className="modal-overlay breathing-overlay" style={{ alignItems: 'center' }} onClick={handleClose}>
      <div
        className="modal-sheet breathing-sheet"
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="breathing-icon-btn breathing-icon-btn--left" onClick={() => setSoundOn(v => !v)} aria-label={soundOn ? '关闭背景音' : '开启背景音'}>
          {soundOn ? <Volume2 size={18} strokeWidth={2} /> : <VolumeX size={18} strokeWidth={2} />}
        </button>
        <button type="button" className="breathing-icon-btn" onClick={handleClose} aria-label="关闭">
          <X size={18} strokeWidth={2} />
        </button>

        <div className="modal-title breathing-title">跟着念念呼吸</div>
        <div className="breathing-sub">
          4 · 4 · 4 节奏 · 共 30 秒
          {soundOn && <span className="breathing-sub-note"> · 背景音已开</span>}
        </div>

        <div className="breathing-visual">
          <svg className="breathing-ring" viewBox="0 0 180 180" aria-hidden>
            <circle cx="90" cy="90" r={RING_R} className="breathing-ring-track" />
            <circle
              cx="90"
              cy="90"
              r={RING_R}
              className="breathing-ring-progress"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - progress)}
            />
          </svg>
          <div
            className="breathing-glow"
            style={{ transform: `scale(${ringScale})` }}
          />
          <img
            src={OTTER_GLOW}
            alt="念念"
            className="otter-round breathing-otter"
            decoding="async"
            style={{ transform: `translate(-50%, -50%) scale(${otterScale})` }}
          />
        </div>

        <div className="breathing-phase">
          {done ? '完成 ✨' : PHASE_LABELS[phase]}
        </div>
        <div className="breathing-count">
          {done ? '0' : phaseCount}
        </div>
        <div className="breathing-hint">
          {done ? '感觉有没有轻松一点？' : PHASE_HINTS[phase]}
        </div>
        {!done && (
          <div className="breathing-remaining">剩余 {remaining} 秒</div>
        )}
      </div>
    </div>
  )
}
