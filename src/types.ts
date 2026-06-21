export type Page = 'splash' | 'home' | 'chat' | 'journal' | 'profile' | 'onboard'

export type ChatMsg = { role: 'ai' | 'user'; text: string }

export type JournalItem = {
  id: string
  date: string
  day: string
  emotion: string
  rating: number
  tags: string[]
  summary: string
  cardImg: string
  ts: number
  /** full=完整对话觉察，quick=轻量一句记录 */
  kind?: 'full' | 'quick'
}

export type ReminderSettings = {
  enabled: boolean
  hour: number
  minute: number
}

export type CardData = {
  id: number
  word: string
  pinyin: string
  guide: string
  cardImg: string
}

/** 分享卡片所需数据（觉察小结 + 情绪卡） */
export type ShareCardPayload = {
  card: CardData
  summary: string
  rating: number
  tags: string[]
  userName: string
  /** 展示日期，默认当天 */
  dateLabel?: string
}
