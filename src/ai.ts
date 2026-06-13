export type ChatMessage = { role: 'user' | 'assistant'; content: string }

import { callChatFunction } from './cloudbase'
import type { MemoryContext } from './utils/memory'

type FnResult = { reply?: string; error?: string; code?: string }

function assertConfig() {
  if (!import.meta.env.VITE_CLOUDBASE_ENV_ID) {
    throw new Error('未配置 VITE_CLOUDBASE_ENV_ID')
  }
}

function raceAbort<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'))
    signal.addEventListener('abort', onAbort, { once: true })
    promise.then(
      v => { signal.removeEventListener('abort', onAbort); resolve(v) },
      e => { signal.removeEventListener('abort', onAbort); reject(e) },
    )
  })
}

async function invokeChat(data: Record<string, unknown>): Promise<string> {
  const res = await callChatFunction(data)
  const result = res.result as FnResult
  if (result?.error) throw new Error(result.error)
  const text = result?.reply?.trim()
  if (!text) throw new Error('念念暂时没有回应，请稍后再试')
  return text
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

/** 逐字展示（云函数 callFunction 无法 SSE，用前端流式体感补偿） */
export async function revealTextProgressively(
  text: string,
  onDelta: (partial: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const chars = [...text]
  let acc = ''
  for (const ch of chars) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    acc += ch
    onDelta(acc)
    const pause = /[，。！？、；：…]/.test(ch) ? 72 : 26
    await sleep(pause)
  }
}

/** 通过 CloudBase 云函数代理调用混元，API Key 不暴露给前端 */
export async function chatWithNianNian(
  params: {
    emotion: string
    guide: string
    userName: string
    messages: ChatMessage[]
    memory?: MemoryContext | null
    signal?: AbortSignal
    onDelta?: (partial: string) => void
  },
): Promise<string> {
  assertConfig()

  const task = invokeChat({
    action: 'chat',
    emotion: params.emotion,
    guide: params.guide,
    userName: params.userName,
    messages: params.messages,
    ...(params.memory
      ? {
          memorySummary: params.memory.summary,
          memoryEmotion: params.memory.emotion,
          memoryDateLabel: params.memory.dateLabel,
        }
      : {}),
  })

  const reply = await raceAbort(task, params.signal)
  if (params.onDelta) {
    await revealTextProgressively(reply, params.onDelta, params.signal)
  }
  return reply
}

/** 根据对话生成今日觉察小结 */
export async function generateAwarenessSummary(
  params: {
    emotion: string
    guide: string
    userName: string
    messages: ChatMessage[]
    signal?: AbortSignal
  },
): Promise<string> {
  assertConfig()

  const task = invokeChat({
    action: 'summary',
    emotion: params.emotion,
    guide: params.guide,
    userName: params.userName,
    messages: params.messages,
  })

  return raceAbort(task, params.signal)
}
