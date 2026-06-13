import { useMemo } from 'react'
import { CARD_COLORS, MOOD_EMOJI, MOOD_LABELS } from '../constants/emotions'
import { buildWeekChartData, normalizeCardImg, WEEK_CHART_MAX } from '../utils/journal'
import type { JournalItem } from '../types'

type JournalPageProps = {
  journal: JournalItem[]
  expandedId: string | null
  onToggleExpand: (id: string | null) => void
  onEdit: (item: JournalItem) => void
  onDelete: (id: string) => void
}

export function JournalPage({
  journal,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
}: JournalPageProps) {
  const weekData = useMemo(() => buildWeekChartData(journal), [journal])

  return (
    <div className="journal-page page-enter">
      <div className="status-bar">
        <div className="status-spacer" aria-hidden />
        <span className="status-date status-date--title">日记本</span>
        <div className="status-spacer" aria-hidden />
      </div>

      <div className="journal-body">
        <section className="week-chart" aria-label="近7天情绪趋势">
          <div className="week-chart-title">近 7 天情绪趋势</div>
          <div className="week-chart-bars">
            {weekData.map((d, i) => {
              const barH = d.hasData ? Math.max(4, Math.round((d.v / WEEK_CHART_MAX) * 54)) : 4
              return (
                <div key={i} className="week-chart-col">
                  <div
                    className={`week-chart-bar ${d.isToday ? 'week-chart-bar--today' : ''} ${d.hasData ? 'week-chart-bar--filled' : ''}`}
                    title={d.hasData ? `${d.emotion ?? ''} · 平均 ${d.v.toFixed(1)} 星` : '无记录'}
                    style={{
                      height: `${barH}px`,
                      ...(d.hasData
                        ? { background: `linear-gradient(180deg, ${d.color}, ${d.color}40)`, boxShadow: d.isToday ? `0 0 0 2px ${d.color}66` : undefined }
                        : { background: d.color }),
                    }}
                  />
                  <div className={`chart-label ${d.isToday ? 'chart-label--today' : ''}`}>{d.l}</div>
                </div>
              )
            })}
          </div>
        </section>

        <div className="journal-list">
          {journal.length === 0 ? (
            <div className="journal-empty">
              还没有日记。
              <br />
              点首页卡牌 → 探索内心 → 生成今日觉察
            </div>
          ) : journal.map(item => {
            const isOpen = expandedId === item.id
            const cardImg = normalizeCardImg(item.cardImg)
            return (
              <article
                key={item.id}
                className={`journal-item ${isOpen ? 'journal-item--open' : ''}`}
                onClick={() => onToggleExpand(isOpen ? null : item.id)}
              >
                <div className="journal-item-accent" style={{ background: CARD_COLORS[item.emotion] }} />
                <div className="journal-item-main">
                  <div className="journal-item-head">
                    <div className="journal-item-meta">
                      <span className="journal-item-date">{item.date} {item.day}</span>
                      <span className="journal-emotion-tag" style={{ color: CARD_COLORS[item.emotion], background: `${CARD_COLORS[item.emotion]}25` }}>
                        {item.emotion}
                      </span>
                      {item.kind === 'quick' && <span className="journal-kind-tag">轻量</span>}
                    </div>
                    <span className="journal-item-rating">
                      {item.rating ? `${MOOD_EMOJI[item.rating]} ${MOOD_LABELS[item.rating]}` : '未评分'}
                    </span>
                  </div>
                  <p className={`journal-preview ${isOpen ? 'journal-preview--open' : ''}`}>{item.summary}</p>
                  {isOpen && (
                    <div className="journal-item-detail">
                      {item.tags.length > 0 && (
                        <div className="journal-tag-row">
                          {item.tags.map(t => (
                            <span key={t} className="journal-tag">{t}</span>
                          ))}
                        </div>
                      )}
                      {cardImg && (
                        <div className="journal-card-ref">
                          <img decoding="async" src={cardImg} alt="" loading="lazy" />
                          <span>来自「{item.emotion}」卡牌</span>
                        </div>
                      )}
                      <div className="journal-item-actions">
                        <button
                          type="button"
                          className="btn-ghost btn-compact"
                          onClick={e => { e.stopPropagation(); onEdit(item) }}
                        >
                          编辑
                        </button>
                        <button
                          type="button"
                          className="btn-ghost btn-compact btn-danger-ghost"
                          onClick={e => { e.stopPropagation(); onDelete(item.id) }}
                        >
                          删除
                        </button>
                      </div>
                      <div className="journal-collapse-hint">点击收起 ▲</div>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
