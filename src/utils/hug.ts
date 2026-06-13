import { HUG_MESSAGES } from '../data'
import type { MemoryContext } from './memory'

export type HugContext = {
  userName: string
  streak: number
  memory: MemoryContext | null
  timeHint: string
}

export function getTimeHint(): string {
  const h = new Date().getHours()
  if (h < 6) return '深夜'
  if (h < 11) return '早晨'
  if (h < 14) return '中午'
  if (h < 18) return '下午'
  if (h < 22) return '晚上'
  return '夜里'
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** AI 不可用时的 contextual 兜底 */
export function pickHugFallback(ctx: HugContext): string {
  const { userName, streak, memory, timeHint } = ctx
  const named = userName && userName !== '朋友' ? userName : '你'

  if (memory?.emotion && Math.random() > 0.25) {
    return pick([
      `${named}，${memory.dateLabel ? `${memory.dateLabel} ` : ''}你聊过的「${memory.emotion}」，不知道今天有没有好一点？不管怎样，我在这儿。`,
      `记得和「${memory.emotion}」有关的事。${timeHint}的这段时间，就允许自己待在任何心情里。`,
    ])
  }

  if (streak >= 7) {
    return pick([
      `${named}，连续 ${streak} 天了——不是任务，是你一直在回来找自己。`,
      `第 ${streak} 天了诶。不用每天都闪闪发光，来了就好。`,
    ])
  }

  if (streak >= 2) {
    return `${named}，${streak} 天了呢。今天哪怕只停一分钟，也算继续了。`
  }

  const timeLines: Partial<Record<string, string>> = {
    深夜: `${named}，${timeHint}还醒着呀。不急，想到什么说什么，我不睡。`,
    早晨: `${named}，${timeHint}好。今天的你，从觉察开始就对自己温柔一点。`,
    中午: `${named}，${timeHint}了，停半分钟，问问身体在说什么。`,
    下午: `${named}，${timeHint}有点累也正常。不用撑，歇一下也算觉察。`,
    晚上: `${named}，${timeHint}了。今天过得怎样都好，我陪你收个尾。`,
    夜里: `${named}，${timeHint}了。把今天先放在这儿，你已经够努力了。`,
  }
  if (Math.random() > 0.45 && timeLines[timeHint]) {
    return timeLines[timeHint]!
  }

  const base = pick(HUG_MESSAGES)
  return Math.random() > 0.5 ? `${named}，${base}` : base
}
