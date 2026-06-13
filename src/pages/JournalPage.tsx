import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'
import { CARD_COLORS, MOOD_EMOJI, MOOD_LABELS } from '../constants/emotions'
import { buildWeekChartData, normalizeCardImg, WEEK_CHART_MAX } from '../utils/journal'
import type { JournalItem } from '../types'

type JournalPageProps = {
  journal: JournalItem[]
  expandedId: string | null
  onToggleExpand: (id: string | null) => void
  onBack: () => void
  onEdit: (item: JournalItem) => void
  onDelete: (id: string) => void
}

export function JournalPage({
  journal,
  expandedId,
  onToggleExpand,
  onBack,
  onEdit,
  onDelete,
}: JournalPageProps) {
  const weekData = useMemo(() => buildWeekChartData(journal), [journal])

  return (
    <div className="journal-page page-enter">
      <div className="journal-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="status-icon" onClick={onBack} style={{ padding: 4 }}><ArrowLeft size={20} strokeWidth={2} /></div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>日记本</div>
        </div>
        <div className="week-chart">
          <div className="week-chart-title">近7天情绪趋势</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64, paddingTop: 4 }}>
            {weekData.map((d, i) => {
              const barH = d.hasData ? Math.max(4, Math.round((d.v / WEEK_CHART_MAX) * 54)) : 4
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div
                    title={d.hasData ? `${d.emotion ?? ''} · 平均 ${d.v.toFixed(1)} 星` : '无记录'}
                    style={{
                      width: '100%', borderRadius: 6, height: `${barH}px`,
                      background: d.hasData
                        ? `linear-gradient(180deg, ${d.color}, ${d.color}40)`
                        : d.color,
                      transition: 'height 0.5s ease',
                      boxShadow: d.isToday && d.hasData ? `0 0 0 2px ${d.color}66` : 'none',
                    }}
                  />
                  <div
                    className="chart-label"
                    style={{
                      fontWeight: d.isToday ? 700 : 400,
                      color: d.isToday ? 'var(--text-dark)' : 'var(--text-muted)',
                    }}
                  >
                    {d.l}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div className="journal-list">
        {journal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.8 }}>
            还没有日记。
            <br />
            点首页卡牌 → 探索内心 → 生成今日觉察
          </div>
        ) : journal.map(item => {
          const isOpen = expandedId === item.id
          const cardImg = normalizeCardImg(item.cardImg)
          return (
            <div
              key={item.id}
              className="journal-item"
              onClick={() => onToggleExpand(isOpen ? null : item.id)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
                <div style={{ width: 5, borderRadius: 3, flexShrink: 0, background: CARD_COLORS[item.emotion] }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dark)' }}>{item.date} {item.day}</span>
                      <span style={{
                        fontSize: 12, padding: '2px 10px', borderRadius: 20,
                        background: `${CARD_COLORS[item.emotion]}25`, color: CARD_COLORS[item.emotion], fontWeight: 600,
                      }}
                      >
                        {item.emotion}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, color: item.rating ? 'var(--text-dark)' : 'var(--text-muted)',
                      letterSpacing: 1, flexShrink: 0, marginLeft: 8,
                    }}
                    >
                      {item.rating ? `${MOOD_EMOJI[item.rating]} ${MOOD_LABELS[item.rating]}` : '未评分'}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: 'vertical',
                  }}
                  >
                    {item.summary}
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                      {item.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          {item.tags.map(t => (
                            <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>{t}</span>
                          ))}
                        </div>
                      )}
                      {cardImg && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                          <img decoding="async" src={cardImg} alt="" style={{ width: 36, height: 48, objectFit: 'cover', borderRadius: 8 }} loading="lazy" />
                          <span>来自「{item.emotion}」卡牌</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
                          onClick={e => { e.stopPropagation(); onEdit(item) }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="btn-ghost"
                          style={{ flex: 1, padding: '8px 12px', fontSize: 13, borderColor: '#C97A6A', color: '#C97A6A' }}
                          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                        >
                          删除
                        </button>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8 }}>点击收起 ▲</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
