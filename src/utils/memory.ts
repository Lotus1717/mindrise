import { formatStatusDate } from '../homeUtils'
import type { JournalItem } from '../types'

export type MemoryContext = {
  emotion: string
  summary: string
  dateLabel: string
}

/** 最近一次觉察摘要，供念念在对话中自然承接 */
export function getMemoryContext(journal: JournalItem[]): MemoryContext | null {
  if (journal.length === 0) return null
  const latest = [...journal].sort((a, b) => b.ts - a.ts)[0]
  const summary = latest.summary?.trim()
  if (!summary) return null
  return {
    emotion: latest.emotion,
    summary: summary.slice(0, 280),
    dateLabel: latest.date || formatStatusDate(new Date(latest.ts)),
  }
}
