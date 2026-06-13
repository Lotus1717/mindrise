import { Home, BookOpen, User } from 'lucide-react'
import type { Page } from '../types'

type BottomNavProps = {
  current: Page
  onSwitch: (page: Page) => void
}

export function BottomNav({ current, onSwitch }: BottomNavProps) {
  if (current === 'splash' || current === 'chat' || current === 'onboard') return null
  return (
    <div className="bottom-nav">
      {[
        { Icon: Home, label: '首页', key: 'home' as Page },
        { Icon: BookOpen, label: '日记本', key: 'journal' as Page },
        { Icon: User, label: '我的', key: 'profile' as Page },
      ].map(item => (
        <div
          key={item.key}
          className={`nav-item ${current === item.key ? 'active' : ''}`}
          onClick={() => onSwitch(item.key)}
        >
          <div className="nav-icon"><item.Icon size={20} strokeWidth={2} /></div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
