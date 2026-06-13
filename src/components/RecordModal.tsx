import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import { emotionTags } from '../data'
import { generateAwarenessSummary, type ChatMessage } from '../ai'
import { OTTER_GLOW } from '../assets'
import { CARD_COLORS, EMOTION_LETTERS, MOOD_EMOJI, MOOD_LABELS } from '../constants/emotions'
import { createJournalItem } from '../utils/journal'
import type { CardData, ChatMsg, JournalItem } from '../types'

type RecordModalProps = {
  card: CardData
  messages: ChatMsg[]
  userName: string
  onCancel: () => void
  onSaved: (item: JournalItem) => void
  onFinish: () => void
  onShare: () => void
  onShareAfterSave?: () => void
}

export function RecordModal({
  card,
  messages,
  userName,
  onCancel,
  onSaved,
  onFinish,
  onShare,
  onShareAfterSave,
}: RecordModalProps) {
  const [rating, setRating] = useState(0)
  const [selTags, setSelTags] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [loadingSummary, setLoadingSummary] = useState(true)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const savingRef = useRef(false)
  const defaultSummary = `今天，我在「念起」与念念一起完成了一次情绪觉察。我感受到的是「${card.word}」——${card.guide} 这个时刻，值得被记住。`

  useEffect(() => {
    const ctrl = new AbortController()
    const apiMsgs: ChatMessage[] = messages.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.text,
    }))
    generateAwarenessSummary({
      emotion: card.word,
      guide: card.guide,
      userName,
      messages: apiMsgs,
      signal: ctrl.signal,
    })
      .then(text => setSummary(text))
      .catch(() => setSummary(''))
      .finally(() => setLoadingSummary(false))
    return () => ctrl.abort()
  }, [card.word, card.guide, messages, userName])

  useEffect(() => {
    if (!saved) return
    const id = setTimeout(onFinish, 1800)
    return () => clearTimeout(id)
  }, [saved, onFinish])

  const handleSave = useCallback(() => {
    if (savingRef.current) return
    savingRef.current = true
    const item = createJournalItem({
      emotion: card.word,
      summary: summary || defaultSummary,
      cardImg: card.cardImg,
      rating,
      tags: selTags,
      kind: 'full',
    })
    onSaved(item)
    setSaved(true)
  }, [rating, selTags, summary, defaultSummary, card, onSaved])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {!saved ? (
          <>
            <div className="modal-title">
              <Sparkles size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              {' '}
              今日觉察
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img decoding="async" src={card.cardImg} alt={card.word} className="card-thumb card-thumb--md" loading="lazy" />
                <div style={{
                  position: 'absolute', bottom: -6, right: -6, width: 22, height: 22, borderRadius: '50%',
                  background: CARD_COLORS[card.word], display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
                >
                  {EMOTION_LETTERS[card.word]}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-dark)', marginBottom: 4 }}>{card.word}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{card.guide}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }} className="field-label">这段觉察</div>
            <div className="record-summary">
              {loadingSummary ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>念念正在帮你收束今天的对话…</div>
              ) : editing ? (
                <textarea
                  className="app-textarea app-textarea--inset"
                  value={summary || defaultSummary}
                  onChange={e => setSummary(e.target.value)}
                  onBlur={() => setEditing(false)}
                  autoFocus
                  rows={4}
                />
              ) : (
                <div onClick={() => setEditing(true)} style={{ cursor: 'text' }}>{summary || defaultSummary}</div>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
              {rating ? `心情：${MOOD_EMOJI[rating]} ${MOOD_LABELS[rating]}` : '选一颗心情，代表今天的状态 →'}
            </div>
            <div className="rating-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`rating-btn emoji ${rating === n ? 'selected-emoji' : ''}`}
                  style={{ opacity: rating && rating !== n ? 0.35 : 1 }}
                  onClick={() => setRating(rating === n ? 0 : n)}
                >
                  {MOOD_EMOJI[n]}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>情绪标签：</div>
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
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <button className="btn-share" style={{ flex: 1, marginBottom: 0 }} onClick={onShare}>分享卡片</button>
              <button className="btn-save" style={{ flex: 2, marginBottom: 0 }} onClick={handleSave}>保存到日记</button>
            </div>
            <button className="btn-ghost" style={{ width: '100%' }} onClick={onCancel}>取消</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                decoding="async"
                loading="lazy"
                src={OTTER_GLOW}
                alt="念念"
                className="otter-round"
                style={{
                  width: 110, height: 110, borderRadius: '50%',
                  animation: 'savePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }}
              />
              <div className="stone-flash" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-dark)', marginTop: 20 }}>念念已收到 💛</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.8 }}>
              你的觉察已保存
              <br />
              每一次觉察，都是一次成长。
            </div>
            {onShareAfterSave && (
              <button className="btn-share" style={{ marginTop: 20 }} onClick={onShareAfterSave}>分享卡片</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
