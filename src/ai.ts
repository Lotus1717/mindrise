export type ChatMessage = { role: 'user' | 'assistant'; content: string }

import { callChatFunction } from './cloudbase'

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

/** 通过 CloudBase 云函数代理调用混元，API Key 不暴露给前端 */
export async function chatWithNianNian(
  params: {
    emotion: string
    guide: string
    userName: string
    messages: ChatMessage[]
    signal?: AbortSignal
  },
): Promise<string> {
  assertConfig()

  const task = (async () => {
    const res = await callChatFunction({
      emotion: params.emotion,
      guide: params.guide,
      userName: params.userName,
      messages: params.messages,
    })
    const result = res.result as FnResult
    if (result?.error) throw new Error(result.error)
    const text = result?.reply?.trim()
    if (!text) throw new Error('念念暂时没有回应，请稍后再试')
    return text
  })()

  return raceAbort(task, params.signal)
}
