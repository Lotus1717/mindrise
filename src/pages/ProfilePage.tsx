import { Bell, Share2, Shield, Phone, Moon, Sun, Info, Clock, Flame } from 'lucide-react'
import { OTTER_GLOW } from '../assets'
import { streakLabel } from '../utils/streak'

type ProfilePageProps = {
  userName: string
  streak: number
  darkMode: boolean
  reminderEnabled: boolean
  reminderHour: number
  reminderMinute: number
  onToggleDark: () => void
  onToggleReminder: () => void
  onOpenReminderTime: () => void
  onEditName: () => void
  onHug: () => void
  onShareApp: () => void
  onPrivacy: () => void
  onCrisis: () => void
  onAbout: () => void
}

export function ProfilePage({
  userName,
  streak,
  darkMode,
  reminderEnabled,
  reminderHour,
  reminderMinute,
  onToggleDark,
  onToggleReminder,
  onOpenReminderTime,
  onEditName,
  onHug,
  onShareApp,
  onPrivacy,
  onCrisis,
  onAbout,
}: ProfilePageProps) {
  const timeLabel = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`
  const streakText = streakLabel(streak)

  return (
    <div className="profile-page page-enter">
      <div className="status-bar">
        <div className="status-spacer" aria-hidden />
        <span className="status-date status-date--title">我的</span>
        <div className="status-icon" onClick={onToggleDark} aria-label={darkMode ? '浅色模式' : '深色模式'}>
          {darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </div>
      </div>

      <div className="profile-body">
        <section className="profile-header">
          <div className="profile-avatar-wrap">
            <img
              decoding="async"
              loading="lazy"
              src={OTTER_GLOW}
              alt="念念"
              className="profile-avatar-img otter-round"
            />
            <span className="profile-avatar-badge" aria-hidden>念</span>
          </div>
          <div className="profile-name">{userName}</div>
          {streakText && (
            <div className="profile-streak">
              <Flame size={14} strokeWidth={2} />
              <span>{streakText}</span>
            </div>
          )}
          <button type="button" className="profile-edit" onClick={onEditName}>编辑昵称 ›</button>
        </section>

        <button type="button" className="profile-hug-btn" onClick={onHug}>🤗 抱抱念念</button>

        <section className="profile-section">
          <h2 className="profile-section-title">觉察习惯</h2>
          <div className="profile-list">
            <div className="profile-list-item" onClick={onToggleReminder}>
              <div className="list-icon list-icon--warm"><Bell size={18} strokeWidth={2} /></div>
              <div className="list-label">每日觉察提醒</div>
              <div
                className={`toggle-switch ${reminderEnabled ? 'toggle-switch--on' : ''}`}
                role="switch"
                aria-checked={reminderEnabled}
                aria-label="每日觉察提醒"
              >
                <div className="toggle-switch-knob" />
              </div>
            </div>
            {reminderEnabled && (
              <div className="profile-list-item profile-list-item--sub" onClick={onOpenReminderTime}>
                <div className="list-icon list-icon--muted"><Clock size={18} strokeWidth={2} /></div>
                <div className="list-label">提醒时间</div>
                <div className="list-time">{timeLabel}</div>
                <div className="list-arrow">›</div>
              </div>
            )}
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-title">支持与分享</h2>
          <div className="profile-list">
            <div className="profile-list-item" onClick={onShareApp}>
              <div className="list-icon"><Share2 size={18} strokeWidth={2} /></div>
              <div className="list-label">分享 App</div>
              <div className="list-arrow">›</div>
            </div>
            <div className="profile-list-item" onClick={onCrisis}>
              <div className="list-icon list-icon--alert"><Phone size={18} strokeWidth={2} /></div>
              <div className="list-label">需要帮助</div>
              <div className="list-arrow">›</div>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section-title">关于</h2>
          <div className="profile-list">
            <div className="profile-list-item" onClick={onPrivacy}>
              <div className="list-icon"><Shield size={18} strokeWidth={2} /></div>
              <div className="list-label">隐私政策</div>
              <div className="list-arrow">›</div>
            </div>
            <div className="profile-list-item" onClick={onAbout}>
              <div className="list-icon"><Info size={18} strokeWidth={2} /></div>
              <div className="list-label">关于念起</div>
              <div className="list-arrow">›</div>
            </div>
          </div>
        </section>

        <div className="profile-footer">念起 · 觉察即自由</div>
      </div>
    </div>
  )
}
