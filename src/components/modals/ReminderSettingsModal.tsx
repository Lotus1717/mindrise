import { useState } from 'react'
import { Bell } from 'lucide-react'
import { ModalChrome } from './ModalChrome'
import { reminderFailureMessage, reminderWarningMessage } from '../../notifications'
import type { ReminderSaveResult } from '../../notifications'
import type { ReminderSettings } from '../../types'

type ReminderSettingsModalProps = {
  settings: ReminderSettings
  onClose: () => void
  onSave: (settings: ReminderSettings) => Promise<ReminderSaveResult>
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function saveFeedback(result: ReminderSaveResult): { kind: 'error' | 'warn' | 'ok'; text: string } | null {
  if (result.ok === false) {
    return { kind: 'error', text: reminderFailureMessage(result.reason) }
  }
  if (result.warning) {
    return { kind: 'warn', text: reminderWarningMessage(result.warning) }
  }
  return null
}

export function ReminderSettingsModal({ settings, onClose, onSave }: ReminderSettingsModalProps) {
  const [enabled, setEnabled] = useState(settings.enabled)
  const [hour, setHour] = useState(settings.hour)
  const [minute, setMinute] = useState(settings.minute)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ kind: 'error' | 'warn' | 'ok'; text: string } | null>(null)

  const timeLabel = `${pad(hour)}:${pad(minute)}`

  const runSave = async (next: ReminderSettings) => {
    if (saving) return
    setSaving(true)
    setFeedback(null)
    try {
      const result = await onSave(next)
      const hint = saveFeedback(result)
      if (hint) {
        setFeedback(hint)
        if (hint.kind === 'warn' && next.enabled && result.ok) {
          setEnabled(true)
        }
        return
      }
      setEnabled(next.enabled)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalChrome
      title={<><Bell size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />每日觉察提醒</>}
      subtitle="念念会在你选定的时刻，轻轻提醒你来抽一张情绪卡。"
      onDismiss={onClose}
    >
      <div className={`reminder-status-pill${enabled ? ' reminder-status-pill--on' : ''}`}>
        {enabled ? `已开启 · 每天 ${timeLabel}` : '当前未开启'}
      </div>

      {feedback && (
        <div className={`reminder-feedback reminder-feedback--${feedback.kind}`} role="alert">
          {feedback.text}
        </div>
      )}

      <div className="field-label field-label--center">提醒时刻</div>
      <div className="time-picker-row">
        <select
          className="app-input time-picker-select"
          value={hour}
          aria-label="小时"
          disabled={saving}
          onChange={e => setHour(Number(e.target.value))}
        >
          {HOURS.map(n => (
            <option key={n} value={n}>{pad(n)}</option>
          ))}
        </select>
        <span className="time-picker-colon">:</span>
        <select
          className="app-input time-picker-select"
          value={minute}
          aria-label="分钟"
          disabled={saving}
          onChange={e => setMinute(Number(e.target.value))}
        >
          {MINUTES.map(n => (
            <option key={n} value={n}>{pad(n)}</option>
          ))}
        </select>
      </div>

      {!enabled ? (
        <button
          type="button"
          className="btn-save"
          disabled={saving}
          onClick={() => runSave({ enabled: true, hour, minute })}
        >
          {saving ? '正在请求权限…' : '开启每日提醒'}
        </button>
      ) : (
        <>
          <button
            type="button"
            className="btn-save"
            disabled={saving}
            onClick={() => runSave({ enabled: true, hour, minute })}
          >
            {saving ? '正在保存…' : '保存设置'}
          </button>
          <button
            type="button"
            className="btn-ghost-full reminder-disable-btn"
            disabled={saving}
            onClick={() => runSave({ enabled: false, hour, minute })}
          >
            关闭提醒
          </button>
        </>
      )}

      <button type="button" className="btn-ghost-full" disabled={saving} onClick={onClose}>取消</button>
    </ModalChrome>
  )
}
