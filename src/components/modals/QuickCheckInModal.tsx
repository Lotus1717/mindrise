import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { CARDS } from '../../data'
import { CARD_COLORS, EMOTION_LETTERS, MOOD_EMOJI, MOOD_LABELS } from '../../constants/emotions'
import { createJournalItem } from '../../utils/journal'
import { ModalChrome } from './ModalChrome'
import type { JournalItem } from '../../types'

type QuickCheckInModalProps = {
  onCancel: () => void
  onSaved: (item: JournalItem) => void
}

export function QuickCheckInModal({ onCancel, onSaved }: QuickCheckInModalProps) {
  const [emotionIdx, setEmotionIdx] = useState(0)
  const [note, setNote] = useState('')
  const [rating, setRating] = useState(3)

  const card = CARDS[emotionIdx]
  const trimmed = note.trim()
  const canSave = trimmed.length >= 2

  const handleSave = () => {
    if (!canSave) return
    onSaved(createJournalItem({
      emotion: card.word,
      summary: trimmed,
      cardImg: card.cardImg,
      rating,
      tags: ['轻量觉察'],
      kind: 'quick',
    }))
  }

  return (
    <ModalChrome
      title={<><PenLine size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />30 秒轻量觉察</>}
      subtitle="不用长聊，选一种感受，记一句就好。"
      onDismiss={onCancel}
    >
      <div className="field-label">此刻的感受</div>
      <div className="quick-mood-grid">
        {CARDS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`quick-mood-chip ${i === emotionIdx ? 'selected' : ''}`}
            style={i === emotionIdx ? { borderColor: CARD_COLORS[c.word], background: `${CARD_COLORS[c.word]}33` } : undefined}
            onClick={() => setEmotionIdx(i)}
          >
            <span className="quick-mood-letter" style={{ background: CARD_COLORS[c.word] }}>
              {EMOTION_LETTERS[c.word] || c.word[0]}
            </span>
            {c.word}
          </button>
        ))}
      </div>

      <div className="field-label">想记的一句</div>
      <textarea
        className="app-textarea"
        placeholder="此刻最想记的一句…"
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        maxLength={120}
      />
      <div className="field-hint">{trimmed.length}/120</div>

      <div className="field-label field-label--center">今天的心情</div>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`rating-btn emoji ${rating === n ? 'selected-emoji' : ''}`}
            style={{ opacity: rating && rating !== n ? 0.35 : 1 }}
            onClick={() => setRating(n)}
            aria-label={MOOD_LABELS[n]}
          >
            {MOOD_EMOJI[n]}
            <span className="rating-label">{MOOD_LABELS[n]}</span>
          </button>
        ))}
      </div>

      <button type="button" className="btn-save" disabled={!canSave} onClick={handleSave}>保存到日记</button>
      <button type="button" className="btn-ghost-full" onClick={onCancel}>取消</button>
    </ModalChrome>
  )
}
