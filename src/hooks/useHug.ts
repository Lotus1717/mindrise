import { useState, useRef, useCallback, useMemo } from 'react'
import { fetchNianNianHug, revealTextProgressively } from '../ai'
import { getMemoryContext } from '../utils/memory'
import { getTimeHint, pickHugFallback } from '../utils/hug'
import type { JournalItem } from '../types'

export function useHug(userName: string, streak: number, journal: JournalItem[]) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const memory = useMemo(() => getMemoryContext(journal), [journal])

  const refresh = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    setMessage('')

    const ctx = { userName, streak, memory, timeHint: getTimeHint() }
    let text = ''

    try {
      text = await fetchNianNianHug({ ...ctx, signal: controller.signal })
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      text = pickHugFallback(ctx)
    }

    if (controller.signal.aborted) return
    setLoading(false)
    try {
      await revealTextProgressively(text, setMessage, controller.signal)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setMessage(text)
    }
  }, [userName, streak, memory])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  return { message, loading, refresh, cancel }
}
