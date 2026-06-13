import { storageGet, storageSet } from './storage'

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const

export function getDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function formatStatusDate(d = new Date()): string {
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEKDAYS[d.getDay()]}`
}

export function getTimeGreeting(d = new Date()): string {
  const h = d.getHours()
  if (h < 6) return '夜深了'
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function defaultCardIdxForDate(dateKey: string, total: number): number {
  let hash = 0
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0
  }
  return hash % total
}

/** 读取今日固定情绪卡（按日期种子，换一张会写入存储） */
export async function resolveTodayCardIdx(total: number): Promise<number> {
  const dateKey = getDateKey()
  const stored = await storageGet<{ dateKey: string; cardIdx: number }>('mindrise-daily-card')
  if (stored?.dateKey === dateKey && stored.cardIdx >= 0 && stored.cardIdx < total) {
    return stored.cardIdx
  }
  const cardIdx = defaultCardIdxForDate(dateKey, total)
  await storageSet('mindrise-daily-card', { dateKey, cardIdx })
  return cardIdx
}

export async function saveTodayCardIdx(cardIdx: number): Promise<void> {
  await storageSet('mindrise-daily-card', { dateKey: getDateKey(), cardIdx })
}

export function getTodayRange(d = new Date()) {
  const start = new Date(d)
  start.setHours(0, 0, 0, 0)
  return { start: start.getTime(), end: start.getTime() + 86400000 }
}

/** 今日是否已有觉察日记 */
export function findTodayEntry<T extends { ts: number }>(items: T[]): T | undefined {
  const { start, end } = getTodayRange()
  return items.find(j => j.ts >= start && j.ts < end)
}
