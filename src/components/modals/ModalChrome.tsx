import type { ReactNode } from 'react'

type ModalChromeProps = {
  title: ReactNode
  subtitle?: string
  children: ReactNode
  onDismiss?: () => void
}

/** 底部弹窗统一结构：拖拽条 + 标题 + 内容 */
export function ModalChrome({ title, subtitle, children, onDismiss }: ModalChromeProps) {
  return (
    <div className="modal-overlay" onClick={onDismiss}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" aria-hidden />
        <div className="modal-title">{title}</div>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
