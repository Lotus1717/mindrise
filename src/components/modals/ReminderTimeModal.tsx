import { useState } from 'react'

type ReminderTimeModalProps = {
  hour: number
  minute: number
  onClose: () => void
  onSave: (hour: number, minute: number) => void
}

function toTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function parseTimeValue(value: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

export function ReminderTimeModal({ hour, minute, onClose, onSave }: ReminderTimeModalProps) {
  const [value, setValue] = useState(toTimeValue(hour, minute))

  const handleSave = () => {
    const parsed = parseTimeValue(value)
    if (!parsed) {
      window.alert('请选择有效的时间')
      return
    }
    onSave(parsed.hour, parsed.minute)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-title">提醒时间</div>
        <p className="quick-check-sub">念念会在每天的这个时刻轻轻提醒你。</p>
        <input
          type="time"
          className="reminder-time-input"
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <button className="btn-save" onClick={handleSave}>保存</button>
        <button className="btn-ghost-full" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}
