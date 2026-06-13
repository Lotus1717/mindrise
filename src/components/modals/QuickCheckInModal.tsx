import { useState } from 'react'
import { CARDS } from '../../data'
import { CARD_COLORS, EMOTION_LETTERS, MOOD_EMOJI, MOOD_LABELS } from '../../constants/emotions'
import { createJournalItem } from '../../utils/journal'
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
  const canSave = note.trim().length >= 2

  const handleSave = () => {
    if (!canSave) return
    const item = createJournalItem({
      emotion: card.word,
      summary: note.trim(),
      cardImg: card.cardImg,
      rating,
      tags: ['轻量觉察'],
      kind: 'quick',
    })
    onSaved(item)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">30 秒轻量觉察</div>
        <p className="quick-check-sub">不用长聊，选一种感受，记一句就好。</p>

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

        <textarea
          className="record-textarea quick-check-input"
          placeholder="此刻最想记的一句…"
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          maxLength={120}
        />

        <div className="rating-row" style={{ marginBottom: 16 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              className={`rating-btn ${rating === n ? 'selected' : ''}`}
              onClick={() => setRating(n)}
            >
              {MOOD_EMOJI[n]}
              <span style={{ fontSize: 10, display: 'block', marginTop: 2 }}>{MOOD_LABELS[n]}</span>
            </button>
          ))}
        </div>

        <button className="btn-save" disabled={!canSave} onClick={handleSave}>保存到日记</button>
        <button className="btn-ghost-full" onClick={onCancel}>取消</button>
      </div>
    </div>
  )
}
