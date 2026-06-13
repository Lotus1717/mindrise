import { useState } from 'react'
import { emotionTags } from '../../data'
import { MOOD_EMOJI, MOOD_LABELS } from '../../constants/emotions'
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">编辑觉察</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>觉察内容</div>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          style={{
            width: '100%', minHeight: 100, padding: 12, borderRadius: 12,
            border: '1.5px solid var(--card-border, #F5EDE3)', fontSize: 14, lineHeight: 1.7,
            background: 'var(--card-bg)', color: 'var(--text-dark)', resize: 'none', fontFamily: 'inherit',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
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
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>标签</div>
        <div className="record-tags">
          {emotionTags.map(t => (
            <div
              key={t}
              className={`tag-chip ${selTags.includes(t) ? 'selected' : ''}`}
              onClick={() => setSelTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
            >
              {t}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn-save"
          onClick={() => onSave({ summary: summary.trim() || item.summary, rating, tags: selTags })}
        >
          保存修改
        </button>
        <button type="button" className="btn-ghost" style={{ width: '100%', marginTop: 10 }} onClick={onCancel}>取消</button>
      </div>
    </div>
  )
}
