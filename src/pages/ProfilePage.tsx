import { ArrowLeft, Bell, Share2, Shield, Phone, Moon, Sun, Info } from 'lucide-react'
import { OTTER_GLOW } from '../assets'

type ProfilePageProps = {
  userName: string
  darkMode: boolean
  reminderEnabled: boolean
  reminderHour: number
  reminderMinute: number
  onBack: () => void
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
  darkMode,
  reminderEnabled,
  reminderHour,
  reminderMinute,
  onBack,
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

  return (
    <div className="profile-page page-enter">
      <div className="status-bar">
        <div className="status-icon" onClick={onBack}><ArrowLeft size={20} strokeWidth={2} /></div>
        <span className="status-date">我的</span>
        <div className="status-icon" onClick={onToggleDark}>
          {darkMode ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </div>
      </div>
      <div className="profile-header">
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <img
            decoding="async"
            loading="lazy"
            src={OTTER_GLOW}
            alt="念念"
            className="otter-round"
            style={{
              width: 72, height: 72, borderRadius: '50%',
              boxShadow: '0 0 30px rgba(255,229,180,0.6)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg,var(--accent-warm),var(--accent-green))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700,
          }}
          >
            念
          </div>
        </div>
        <div className="profile-name">{userName}</div>
        <div className="profile-edit" onClick={onEditName} style={{ cursor: 'pointer' }}>编辑昵称 ›</div>
      </div>
      <button className="profile-hug-btn" onClick={onHug}>🤗 抱抱念念</button>
      <div className="profile-list">
        <div className="profile-list-item" onClick={onToggleReminder}>
          <div className="list-icon"><Bell size={18} strokeWidth={2} /></div>
          <div className="list-label">每日觉察提醒</div>
          <div style={{
            width: 44, height: 26, borderRadius: 13, background: reminderEnabled ? 'var(--accent-warm)' : 'rgba(0,0,0,0.12)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}
          >
            <div style={{
              position: 'absolute', top: 3, left: reminderEnabled ? 21 : 3, width: 20, height: 20,
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }}
            />
          </div>
        </div>
        {reminderEnabled && (
          <div className="profile-list-item" onClick={onOpenReminderTime}>
            <div className="list-icon"><Bell size={18} strokeWidth={2} style={{ opacity: 0.5 }} /></div>
            <div className="list-label">提醒时间</div>
            <div className="list-time">{timeLabel}</div>
            <div className="list-arrow">›</div>
          </div>
        )}
        <div className="profile-list-item" onClick={onShareApp}>
          <div className="list-icon"><Share2 size={18} strokeWidth={2} /></div>
          <div className="list-label">分享App</div>
          <div className="list-arrow">›</div>
        </div>
        <div className="profile-list-item" onClick={onPrivacy}>
          <div className="list-icon"><Shield size={18} strokeWidth={2} /></div>
          <div className="list-label">隐私政策</div>
          <div className="list-arrow">›</div>
        </div>
        <div className="profile-list-item" onClick={onCrisis}>
          <div className="list-icon"><Phone size={18} strokeWidth={2} /></div>
          <div className="list-label">需要帮助</div>
          <div className="list-arrow">›</div>
        </div>
        <div className="profile-list-item" onClick={onToggleDark}>
          <div className="list-icon">{darkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}</div>
          <div className="list-label">深色模式</div>
          <div className="list-arrow">›</div>
        </div>
        <div className="profile-list-item" onClick={onAbout}>
          <div className="list-icon"><Info size={18} strokeWidth={2} /></div>
          <div className="list-label">关于念起</div>
          <div className="list-arrow">›</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 12 }}>念起 · 觉察即自由</div>
    </div>
  )
}
