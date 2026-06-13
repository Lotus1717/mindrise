import { useRef } from 'react'
import { ModalChrome } from './ModalChrome'

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
    <ModalChrome title="编辑昵称" onDismiss={onClose}>
      <div className="field-label">昵称</div>
      <input
        ref={inputRef}
        className="app-input"
        defaultValue={userName}
        maxLength={12}
        autoFocus
        placeholder="怎么称呼你？"
        onKeyDown={e => { if (e.key === 'Enter') save() }}
      />
      <div className="modal-actions-row">
        <button type="button" className="btn-ghost" onClick={onClose}>取消</button>
        <button type="button" className="btn-save" style={{ marginBottom: 0 }} onClick={save}>保存</button>
      </div>
    </ModalChrome>
  )
}
