import { getDateKey } from '../homeUtils'
import type { JournalItem } from '../types'

/** 有觉察记录的日期集合 */
function journalDateKeys(journal: JournalItem[]): Set<string> {
  const keys = new Set<string>()
  for (const item of journal) {
    keys.add(getDateKey(new Date(item.ts)))
  }
  return keys
}

/**
 * 连续觉察天数：从今天或昨天起向前数（今日未完成仍保留昨日起的 streak）
 */
export function computeStreak(journal: JournalItem[]): number {
  if (journal.length === 0) return 0
  const dates = journalDateKeys(journal)
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  if (!dates.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (dates.has(getDateKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function streakLabel(streak: number): string {
  if (streak <= 0) return ''
  if (streak === 1) return '已连续觉察 1 天'
  return `已连续觉察 ${streak} 天`
}
