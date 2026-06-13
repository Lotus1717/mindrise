import { Moon, Sun, Calendar, Flame } from 'lucide-react'
import { CARD_COLORS } from '../constants/emotions'
import { formatStatusDate, getTimeGreeting } from '../homeUtils'
import { streakLabel } from '../utils/streak'
import type { CardData, JournalItem } from '../types'

type HomePageProps = {
  userName: string
  card: CardData
  todayEntry?: JournalItem
  streak: number
  changing: boolean
  darkMode: boolean
  onToggleDark: () => void
  onGoJournal: () => void
  onEnterChat: () => void
  onNextCard: () => void
  onReviewToday: () => void
  onQuickCheckIn: () => void
}

export function HomePage({
  userName,
  card,
  todayEntry,
  streak,
  changing,
  darkMode,
  onToggleDark,
  onGoJournal,
  onEnterChat,
  onNextCard,
  onReviewToday,
  onQuickCheckIn,
}: HomePageProps) {
  const streakText = streakLabel(streak)
  return (
    <div className="page-enter">
      <div className="status-bar">
        <div className="status-icon" onClick={onToggleDark}>
          {darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </div>
        <span className="status-date">{formatStatusDate()}</span>
        <div className="status-icon" onClick={onGoJournal}><Calendar size={16} strokeWidth={2} /></div>
      </div>
      <div className="home-page">
        <div className="home-greeting-row">
          <div className="home-greeting">{getTimeGreeting()}，{userName}</div>
          {streakText && (
            <div className="streak-banner streak-banner--inline">
              <Flame size={14} strokeWidth={2} />
              <span>{streakText}</span>
            </div>
          )}
        </div>
        {todayEntry && (
          <div className="today-done-banner">
            <span className="today-done-check">✓</span>
            <div>
              <div className="today-done-title">今日觉察已完成</div>
              <div className="today-done-preview">
                {todayEntry.emotion} · {todayEntry.summary.slice(0, 36)}
                {todayEntry.summary.length > 36 ? '…' : ''}
              </div>
            </div>
          </div>
        )}
        <div className={`card-container ${changing ? 'card-out' : 'card-in'}`}>
          <div className="emotion-card" onClick={onEnterChat} style={{ cursor: 'pointer' }}>
            <div className={`daily-card-badge ${todayEntry ? 'daily-card-badge-done' : ''}`}>
              {todayEntry ? '今日已完成 ✓' : '今日情绪卡'}
            </div>
            <div style={{ position: 'relative', width: '100%', height: 215, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
              <img decoding="async" src={card.cardImg} alt={card.word} style={{ width: '100%', height: '100%', objectFit: 'cover' }} fetchPriority="high" />
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(160deg,${CARD_COLORS[card.word]}cc,${CARD_COLORS[card.word]}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              >
                <div className="card-art-orb" />
              </div>
            </div>
            <div className="card-emotion-word" style={{ letterSpacing: 6 }}>{card.word}</div>
            <div className="card-guide">{card.guide}</div>
            <div className="card-hint">▼ {todayEntry ? '点击和念念再聊聊' : '点击探索内心'}</div>
          </div>
        </div>
        <div className="card-actions">
          {todayEntry ? (
            <>
              <button className="btn-primary" onClick={onReviewToday}>回顾今天的觉察</button>
              <button className="btn-ghost" onClick={onEnterChat}>和念念再聊聊</button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={onEnterChat}>探索这张卡</button>
              <button className="btn-ghost" onClick={onNextCard}>换一张</button>
            </>
          )}
        </div>
        {!todayEntry && (
          <button type="button" className="btn-quick-check" onClick={onQuickCheckIn}>
            今天只想记一句 →
          </button>
        )}
      </div>
    </div>
  )
}
