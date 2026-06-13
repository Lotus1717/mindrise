import { useState, useRef, useEffect, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react'
import { CARDS } from '../data'
import { chatWithNianNian, type ChatMessage } from '../ai'
import { NIANGQIAN_OFFLINE, NIANGQIAN_CLOSING } from '../fallback'
import { MAX_MSGS } from '../constants/emotions'
import { OTTER_DEFAULT, OTTER_CURIOUS } from '../assets'
import type { ChatMsg } from '../types'

export function useChat(
  cardIdx: number,
  userName: string,
  chatHistory: Record<number, ChatMsg[]>,
  setChatHistory: Dispatch<SetStateAction<Record<number, ChatMsg[]>>>,
) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [chatError, setChatError] = useState<'open' | 'send' | null>(null)
  const [otterMood, setOtterMood] = useState(OTTER_DEFAULT)
  const [showTip, setShowTip] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)

  const endRef = useRef<HTMLDivElement>(null)
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatAbortRef = useRef<AbortController | null>(null)

  const toApiMessages = useCallback((list: ChatMsg[]): ChatMessage[] =>
    list.map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text })), [])

  const userMsgCount = useMemo(() => msgs.filter(m => m.role === 'user').length, [msgs])
  const canFinishChat = userMsgCount >= 1

  const requestAiReply = useCallback(async (
    emotion: string,
    guide: string,
    history: ChatMessage[],
    onDelta?: (partial: string) => void,
  ) => {
    chatAbortRef.current?.abort()
    const controller = new AbortController()
    chatAbortRef.current = controller
    return chatWithNianNian({
      emotion,
      guide,
      userName,
      messages: history,
      signal: controller.signal,
      onDelta,
    })
  }, [userName])

  const startChat = useCallback(async (forceNew = false) => {
    const card = CARDS[cardIdx]
    const existing = chatHistory[cardIdx]
    setOtterMood(OTTER_CURIOUS)
    setShowTip(false)
    setChatError(null)
    if (!forceNew && existing && existing.length > 0) {
      setMsgs(existing)
      return
    }
    setMsgs([])
    setTyping(true)
    try {
      const reply = await requestAiReply(card.word, card.guide, [], partial => {
        setTyping(false)
        setMsgs([{ role: 'ai', text: partial }])
      })
      const opening: ChatMsg[] = [{ role: 'ai', text: reply }]
      setMsgs(opening)
      setChatHistory(h => ({ ...h, [cardIdx]: opening }))
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setChatError('open')
      setMsgs([{ role: 'ai', text: NIANGQIAN_OFFLINE }])
    } finally {
      setTyping(false)
    }
  }, [cardIdx, chatHistory, requestAiReply])

  const sendText = useCallback(async (text: string) => {
    const trimmedText = text.trim()
    if (!trimmedText || typing) return
    const card = CARDS[cardIdx]
    const userMsg: ChatMsg = { role: 'user', text: trimmedText }
    const withUser = [...msgs, userMsg]
    const trimmed = withUser.length > MAX_MSGS ? withUser.slice(Math.floor(MAX_MSGS / 3)) : withUser

    setMsgs(trimmed)
    setChatHistory(h => ({ ...h, [cardIdx]: trimmed }))
    setInput('')
    setTyping(true)
    setShowTip(false)
    setChatError(null)

    try {
      const reply = await requestAiReply(card.word, card.guide, toApiMessages(trimmed), partial => {
        setTyping(false)
        setMsgs(prev => {
          const base = prev.length > 0 && prev[prev.length - 1]?.role === 'ai'
            ? prev.slice(0, -1)
            : prev
          return [...base, { role: 'ai', text: partial }]
        })
      })
      const aiMsg: ChatMsg = { role: 'ai', text: reply }
      const final = [...trimmed, aiMsg]
      const clipped = final.length > MAX_MSGS ? final.slice(Math.floor(MAX_MSGS / 3)) : final
      setMsgs(clipped)
      setChatHistory(h => ({ ...h, [cardIdx]: clipped }))
      setOtterMood(Math.random() > 0.4 ? OTTER_CURIOUS : OTTER_DEFAULT)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setChatError('send')
      setMsgs(prev => [...prev, { role: 'ai', text: NIANGQIAN_OFFLINE }])
      setChatHistory(h => ({ ...h, [cardIdx]: [...trimmed, { role: 'ai', text: NIANGQIAN_OFFLINE }] }))
    } finally {
      setTyping(false)
    }
  }, [cardIdx, msgs, typing, requestAiReply, toApiMessages])

  const handleSend = useCallback(() => sendText(input), [input, sendText])

  const retryChat = useCallback(async () => {
    if (chatError === 'open') {
      await startChat(true)
      return
    }
    if (chatError !== 'send' || typing) return
    const card = CARDS[cardIdx]
    const history = toApiMessages(msgs.filter(m => m.text !== NIANGQIAN_OFFLINE))
    if (history.length === 0) return
    setChatError(null)
    setTyping(true)
    try {
      const reply = await requestAiReply(card.word, card.guide, history, partial => {
        setTyping(false)
        setMsgs(prev => {
          const withoutErr = prev.filter(m => m.text !== NIANGQIAN_OFFLINE)
          const base = withoutErr.length > 0 && withoutErr[withoutErr.length - 1]?.role === 'ai'
            ? withoutErr.slice(0, -1)
            : withoutErr
          return [...base, { role: 'ai', text: partial }]
        })
      })
      const withoutErr = msgs.filter(m => m.text !== NIANGQIAN_OFFLINE)
      const final = [...withoutErr, { role: 'ai' as const, text: reply }]
      const clipped = final.length > MAX_MSGS ? final.slice(Math.floor(MAX_MSGS / 3)) : final
      setMsgs(clipped)
      setChatHistory(h => ({ ...h, [cardIdx]: clipped }))
      setOtterMood(Math.random() > 0.4 ? OTTER_CURIOUS : OTTER_DEFAULT)
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setChatError('send')
      setMsgs(prev => [...prev.filter(m => m.text !== NIANGQIAN_OFFLINE), { role: 'ai', text: NIANGQIAN_OFFLINE }])
    } finally {
      setTyping(false)
    }
  }, [chatError, typing, cardIdx, msgs, requestAiReply, toApiMessages, startChat])

  const handleFinishChat = useCallback(() => {
    if (!canFinishChat || typing) return false
    const closing: ChatMsg = { role: 'ai', text: NIANGQIAN_CLOSING }
    const updated = [...msgs, closing]
    setMsgs(updated)
    setChatHistory(h => ({ ...h, [cardIdx]: updated }))
    return true
  }, [canFinishChat, typing, msgs, cardIdx])

  const clearChat = useCallback(() => {
    setMsgs([])
    setChatHistory(h => ({ ...h, [cardIdx]: [] }))
  }, [cardIdx])

  const filterRecordMessages = useCallback(
    () => msgs.filter(m => m.text !== NIANGQIAN_CLOSING && m.text !== NIANGQIAN_OFFLINE),
    [msgs],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  useEffect(() => () => { chatAbortRef.current?.abort() }, [])

  return {
    msgs, input, setInput, typing, chatError, otterMood,
    showTip, setShowTip, tipIdx, setTipIdx,
    endRef, tipTimerRef,
    canFinishChat, startChat, handleSend, sendText, retryChat,
    handleFinishChat, clearChat, filterRecordMessages,
  }
}
