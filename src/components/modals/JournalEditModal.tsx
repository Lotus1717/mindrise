import { useState } from 'react'
import { emotionTags } from '../../data'
import { MOOD_EMOJI, MOOD_LABELS } from '../../constants/emotions'
import { ModalChrome } from './ModalChrome'
import type { JournalItem } from '../../types'

type JournalEditModalProps = {
  item: JournalItem
  onCancel: () => void
  onSave: (patch: Pick<JournalItem, 'summary' | 'rating' | 'tags'>) => void
}

export function JournalEditModal({ item, onCancel, onSave }: JournalEditModalProps) {
  const [summary, setSummary] = useState(item.summary)
  const [rating, setRating] = useState(item.rating)
  const [selTags, setSelTags] = useState<string[]>(item.tags)

  return (
    <ModalChrome title="编辑觉察" onDismiss={onCancel}>
      <div className="field-label">觉察内容</div>
      <textarea
        className="app-textarea"
        value={summary}
        onChange={e => setSummary(e.target.value)}
        rows={4}
      />

      <div className="field-label field-label--center">
        {rating ? `心情：${MOOD_EMOJI[rating]} ${MOOD_LABELS[rating]}` : '心情评分'}
      </div>
      <div className="rating-row">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className={`rating-btn emoji ${rating === n ? 'selected-emoji' : ''}`}
            style={{ opacity: rating && rating !== n ? 0.35 : 1 }}
            onClick={() => setRating(rating === n ? 0 : n)}
          >
            {MOOD_EMOJI[n]}
          </button>
        ))}
      </div>

      <div className="field-label">标签</div>
      <div className="record-tags">
        {emotionTags.map(t => (
          <button
            key={t}
            type="button"
            className={`tag-chip ${selTags.includes(t) ? 'selected' : ''}`}
            onClick={() => setSelTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
          >
            {t}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="btn-save"
        onClick={() => onSave({ summary: summary.trim() || item.summary, rating, tags: selTags })}
      >
        保存修改
      </button>
      <button type="button" className="btn-ghost-full" onClick={onCancel}>取消</button>
    </ModalChrome>
  )
}
