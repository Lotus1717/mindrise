import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { storageGet, storageSet } from '../storage'
import { migrateJournalItems } from '../utils/journal'
import {
  loadReminderSettings,
  persistReminderPreference,
  syncReminderIfNeeded,
  syncReminderToNative,
  type ReminderSaveResult,
} from '../notifications'
import type { ChatMsg, JournalItem, ReminderSettings } from '../types'

export function useAppStorage() {
  const [darkMode, setDarkMode] = useState(false)
  const [userName, setUserName] = useState('朋友')
  const [onboarded, setOnboarded] = useState(false)
  const [journal, setJournal] = useState<JournalItem[]>([])
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMsg[]>>({})
  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, hour: 20, minute: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    (async () => {
      const [dark, name, onboard, j, chat, rem] = await Promise.all([
        storageGet<string>('mindrise-dark'),
        storageGet<string>('mindrise-name'),
        storageGet<string>('nianqi-onboarded'),
        storageGet<JournalItem[]>('mindrise-journal'),
        storageGet<Record<number, ChatMsg[]>>('mindrise-chat'),
        loadReminderSettings(),
      ])
      if (dark !== null) setDarkMode(dark === '1')
      if (name !== null) setUserName(name)
      if (onboard !== null) setOnboarded(true)
      if (j) setJournal(migrateJournalItems(j))
      if (chat) setChatHistory(chat)
      setReminder(rem)
      setLoaded(true)
      void syncReminderIfNeeded(rem)
    })()
  }, [])

  useEffect(() => { if (loaded) storageSet('mindrise-dark', darkMode ? '1' : '0') }, [darkMode, loaded])
  useEffect(() => { if (loaded) storageSet('mindrise-name', userName) }, [userName, loaded])
  useEffect(() => { if (loaded) storageSet('mindrise-journal', journal) }, [journal, loaded])
  useEffect(() => { if (loaded) storageSet('mindrise-chat', chatHistory) }, [chatHistory, loaded])

  const finishOnboard = () => {
    setOnboarded(true)
    storageSet('nianqi-onboarded', '1')
  }

  /** 只写偏好，不阻塞在系统权限上 */
  const updateReminder = async (next: ReminderSettings): Promise<ReminderSaveResult> => {
    let prev!: ReminderSettings
    flushSync(() => {
      setReminder(current => {
        prev = current
        return next
      })
    })

    try {
      await persistReminderPreference(next)
      return { ok: true }
    } catch (err) {
      console.warn('[reminder] persist failed', err)
      flushSync(() => setReminder(prev))
      return { ok: false, reason: 'schedule_failed' }
    }
  }

  /** 弹窗关闭后再调：请求权限 + 注册通知 */
  const syncReminderNative = (settings: ReminderSettings) => syncReminderToNative(settings)

  const updateJournalItem = (id: string, patch: Partial<JournalItem>) => {
    setJournal(j => j.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  const deleteJournalItem = (id: string) => {
    setJournal(j => j.filter(item => item.id !== id))
  }

  return {
    darkMode, setDarkMode,
    userName, setUserName,
    onboarded, finishOnboard,
    journal, setJournal, updateJournalItem, deleteJournalItem,
    chatHistory, setChatHistory,
    reminder, updateReminder, syncReminderNative,
    loaded,
  }
}
