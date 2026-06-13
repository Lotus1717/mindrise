import { useState } from 'react'
import { Bell } from 'lucide-react'
import { ModalChrome } from './ModalChrome'

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
    <ModalChrome
      title={<><Bell size={16} strokeWidth={2} style={{ marginRight: 6, verticalAlign: 'middle' }} />提醒时间</>}
      subtitle="念念会在每天的这个时刻轻轻提醒你。"
      onDismiss={onClose}
    >
      <div className="field-label field-label--center">选择时间</div>
      <input
        type="time"
        className="app-input app-input--time"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <button type="button" className="btn-save" onClick={handleSave}>保存</button>
      <button type="button" className="btn-ghost-full" onClick={onClose}>取消</button>
    </ModalChrome>
  )
}
