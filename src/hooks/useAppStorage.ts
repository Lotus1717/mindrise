import { useState, useEffect } from 'react'
import { storageGet, storageSet } from '../storage'
import { migrateJournalItems } from '../utils/journal'
import { loadReminderSettings, saveReminderSettings } from '../notifications'
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

  const updateReminder = async (next: ReminderSettings) => {
    setReminder(next)
    await saveReminderSettings(next)
  }

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
    reminder, updateReminder,
    loaded,
  }
}
