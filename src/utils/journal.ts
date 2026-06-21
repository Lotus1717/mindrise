import { CARDS } from '../data'
import { CARD_COLORS } from '../constants/emotions'
import type { CardData, JournalItem, ShareCardPayload } from '../types'

export function normalizeCardImg(img: string): string {
  return img.replace(/\.png(\?.*)?$/i, '.webp')
}

export function migrateJournalItems(items: JournalItem[]): JournalItem[] {
  return items.map(j => ({ ...j, cardImg: normalizeCardImg(j.cardImg) }))
}

export type WeekChartDay = {
  l: string
  v: number
  isToday: boolean
  hasData: boolean
  emotion: string | null
  color: string
}

export function buildWeekChartData(journal: JournalItem[]): WeekChartDay[] {
  const days = ['日', '一', '二', '三', '四', '五', '六'] as const
  const now = new Date()
  const result: WeekChartDay[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const start = d.getTime()
    const end = start + 86400000
    const dayItems = journal.filter(j => j.ts >= start && j.ts < end)
    const latest = dayItems.sort((a, b) => b.ts - a.ts)[0]
    const avg = dayItems.length
      ? dayItems.reduce((s, j) => s + (j.rating || 0), 0) / dayItems.length
      : 0
    const emotion = latest?.emotion ?? null
    result.push({
      l: days[d.getDay()],
      v: avg,
      isToday: i === 0,
      hasData: dayItems.length > 0,
      emotion,
      color: emotion ? (CARD_COLORS[emotion] || '#F5A87F') : 'rgba(0,0,0,0.06)',
    })
  }
  return result
}

export const WEEK_CHART_MAX = 5

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

/** 日记条目 → 分享卡片数据 */
export function journalToSharePayload(item: JournalItem, userName: string): ShareCardPayload {
  const cardImg = normalizeCardImg(item.cardImg)
  const found = CARDS.find(c => c.word === item.emotion)
  const card: CardData = found
    ? { ...found, cardImg }
    : { id: 0, word: item.emotion, pinyin: '', guide: '', cardImg }
  return {
    card,
    summary: item.summary,
    rating: item.rating,
    tags: item.tags,
    userName,
    dateLabel: `${item.date} ${item.day}`,
  }
}

export function createJournalItem(
  params: Pick<JournalItem, 'emotion' | 'summary' | 'cardImg' | 'rating' | 'tags' | 'kind'>,
): JournalItem {
  const now = new Date()
  return {
    id: String(Date.now()),
    date: `${now.getMonth() + 1}月${now.getDate()}日`,
    day: WEEKDAY_NAMES[now.getDay()],
    emotion: params.emotion,
    rating: params.rating,
    tags: params.tags,
    summary: params.summary,
    cardImg: normalizeCardImg(params.cardImg),
    ts: now.getTime(),
    kind: params.kind ?? 'full',
  }
}
