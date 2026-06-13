import { useRef } from 'react'

type EditNameModalProps = {
  userName: string
  onClose: () => void
  onSave: (name: string) => void
}

export function EditNameModal({ userName, onClose, onSave }: EditNameModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const save = () => {
    const v = (inputRef.current?.value || '').trim()
    if (v) onSave(v)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px' }}>
        <div className="modal-title">编辑昵称</div>
        <input
          ref={inputRef}
          defaultValue={userName}
          maxLength={12}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save() }}
          style={{
            width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #E8B4A2',
            fontSize: 15, outline: 'none', background: 'var(--card-bg)', color: 'var(--text-dark)',
            marginBottom: 16, boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>取消</button>
          <button className="btn-save" style={{ flex: 2 }} onClick={save}>保存</button>
        </div>
      </div>
    </div>
  )
}
