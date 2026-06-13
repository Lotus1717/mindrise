import { useState, useEffect, useMemo, useCallback } from 'react'
import './index.css'
import { CARDS, HUG_MESSAGES } from './data'
import { OTTER_DEFAULT, SPLASH_FRAMES } from './assets'
import { preloadImage, preloadImages, preloadImagesIdle } from './preload'
import { findTodayEntry, resolveTodayCardIdx, saveTodayCardIdx } from './homeUtils'
import { computeStreak } from './utils/streak'
import { NIANGQIAN_GUIDANCE } from './fallback'
import { requestNotificationPermission } from './notifications'
import { useAppStorage } from './hooks/useAppStorage'
import { useChat } from './hooks/useChat'
import type { Page, JournalItem } from './types'
import { BottomNav } from './components/BottomNav'
import { RecordModal } from './components/RecordModal'
import { ShareCardModal } from './components/ShareCardModal'
import { BreathingModal } from './components/BreathingModal'
import { PrivacyModal } from './components/modals/PrivacyModal'
import { CrisisModal } from './components/modals/CrisisModal'
import { AboutModal } from './components/modals/AboutModal'
import { HugModal } from './components/modals/HugModal'
import { EditNameModal } from './components/modals/EditNameModal'
import { JournalEditModal } from './components/modals/JournalEditModal'
import { QuickCheckInModal } from './components/modals/QuickCheckInModal'
import { ReminderTimeModal } from './components/modals/ReminderTimeModal'
import { SplashPage } from './pages/SplashPage'
import { OnboardPage } from './pages/OnboardPage'
import { HomePage } from './pages/HomePage'
import { ChatPage } from './pages/ChatPage'
import { JournalPage } from './pages/JournalPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  const storage = useAppStorage()
  const [page, setPage] = useState<Page>('splash')
  const [cardIdx, setCardIdx] = useState(0)
  const [changing, setChanging] = useState(false)
  const [onboardIdx, setOnboardIdx] = useState(0)
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null)
  const [editJournalItem, setEditJournalItem] = useState<JournalItem | null>(null)

  const [showRecord, setShowRecord] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showCrisis, setShowCrisis] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showHug, setShowHug] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false)
  const [showReminderTime, setShowReminderTime] = useState(false)
  const [hugIdx, setHugIdx] = useState(() => Math.floor(Math.random() * HUG_MESSAGES.length))

  const chat = useChat(
    cardIdx,
    storage.userName,
    storage.journal,
    storage.chatHistory,
    storage.setChatHistory,
  )

  const card = CARDS[cardIdx]
  const todayEntry = useMemo(() => findTodayEntry(storage.journal), [storage.journal])
  const streak = useMemo(() => computeStreak(storage.journal), [storage.journal])

  useEffect(() => {
    preloadImages([OTTER_DEFAULT, CARDS[0].cardImg])
    preloadImagesIdle(CARDS.map(c => c.cardImg))
    preloadImagesIdle(SPLASH_FRAMES)
  }, [])

  useEffect(() => {
    resolveTodayCardIdx(CARDS.length).then(setCardIdx)
  }, [])

  useEffect(() => {
    preloadImage(CARDS[cardIdx].cardImg)
    preloadImage(CARDS[(cardIdx + 1) % CARDS.length].cardImg)
  }, [cardIdx])

  useEffect(() => {
    if (page !== 'chat' || chat.msgs.length === 0) return
    if (chat.tipTimerRef.current) clearTimeout(chat.tipTimerRef.current)
    chat.tipTimerRef.current = setTimeout(() => {
      chat.setShowTip(true)
      chat.setTipIdx(Math.floor(Math.random() * NIANGQIAN_GUIDANCE.length))
    }, 15000)
    return () => {
      if (chat.tipTimerRef.current) clearTimeout(chat.tipTimerRef.current)
    }
  }, [page, chat.msgs.length, chat.setShowTip, chat.setTipIdx, chat.tipTimerRef])

  const enterChat = useCallback(() => {
    setPage('chat')
    chat.startChat()
  }, [chat.startChat])

  const handleNext = useCallback(async () => {
    const nextIdx = (cardIdx + 1) % CARDS.length
    await preloadImage(CARDS[nextIdx].cardImg)
    setChanging(true)
    setTimeout(() => {
      setCardIdx(nextIdx)
      saveTodayCardIdx(nextIdx)
      setChanging(false)
    }, 220)
  }, [cardIdx])

  const reviewToday = useCallback(() => {
    if (!todayEntry) return
    setExpandedJournal(todayEntry.id)
    setPage('journal')
  }, [todayEntry])

  const handleFinishChat = () => {
    if (chat.handleFinishChat()) setShowRecord(true)
  }

  const handleToggleReminder = async () => {
    const next = { ...storage.reminder, enabled: !storage.reminder.enabled }
    if (next.enabled) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        window.alert('请在系统设置中允许通知，才能收到每日觉察提醒。')
        return
      }
    }
    await storage.updateReminder(next)
  }

  const handleSaveReminderTime = async (hour: number, minute: number) => {
    const next = { ...storage.reminder, hour, minute }
    if (next.enabled) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        window.alert('请在系统设置中允许通知，才能收到每日觉察提醒。')
        return
      }
    }
    await storage.updateReminder(next)
    setShowReminderTime(false)
  }

  const handleQuickCheckInSaved = (item: JournalItem) => {
    storage.setJournal(j => [item, ...j])
    setShowQuickCheckIn(false)
  }

  const openHug = () => {
    setHugIdx(Math.floor(Math.random() * HUG_MESSAGES.length))
    setShowHug(true)
  }

  if (page === 'splash') {
    return (
      <SplashPage
        onboarded={storage.onboarded}
        onEnter={target => setPage(target)}
      />
    )
  }

  if (page === 'onboard') {
    return (
      <OnboardPage
        stepIndex={onboardIdx}
        onNext={() => setOnboardIdx(i => i + 1)}
        onSkip={() => { storage.finishOnboard(); setPage('home') }}
        onComplete={() => { storage.finishOnboard(); setPage('home') }}
      />
    )
  }

  return (
    <div className={`app-container ${storage.darkMode ? 'dark-mode' : ''}${page === 'chat' ? ' app-container--chat' : ''}`}>
      {page !== 'chat' && (
        <img className="otter-float" src={OTTER_DEFAULT} alt="戳戳念念" onClick={openHug} />
      )}

      {page === 'home' && (
        <HomePage
          userName={storage.userName}
          card={card}
          todayEntry={todayEntry}
          streak={streak}
          changing={changing}
          darkMode={storage.darkMode}
          onToggleDark={() => storage.setDarkMode(d => !d)}
          onGoJournal={() => setPage('journal')}
          onEnterChat={enterChat}
          onNextCard={handleNext}
          onReviewToday={reviewToday}
          onQuickCheckIn={() => setShowQuickCheckIn(true)}
        />
      )}

      {page === 'chat' && (
        <ChatPage
          card={card}
          msgs={chat.msgs}
          input={chat.input}
          typing={chat.typing}
          otterMood={chat.otterMood}
          canFinishChat={chat.canFinishChat}
          showFinishRow={!showRecord}
          chatError={chat.chatError}
          showTip={chat.showTip}
          tipText={NIANGQIAN_GUIDANCE[chat.tipIdx]}
          endRef={chat.endRef}
          onBack={() => setPage('home')}
          onInputChange={chat.setInput}
          onSend={chat.handleSend}
          onQuickReply={text => chat.sendText(text)}
          onFinishChat={handleFinishChat}
          onGenerateRecord={() => setShowRecord(true)}
          onRetry={chat.retryChat}
          onBreathing={() => setShowBreathing(true)}
        />
      )}

      {page === 'journal' && (
        <JournalPage
          journal={storage.journal}
          expandedId={expandedJournal}
          onToggleExpand={setExpandedJournal}
          onEdit={item => setEditJournalItem(item)}
          onDelete={id => {
            if (window.confirm('确定删除这条觉察吗？')) storage.deleteJournalItem(id)
          }}
        />
      )}

      {page === 'profile' && (
        <ProfilePage
          userName={storage.userName}
          streak={streak}
          darkMode={storage.darkMode}
          reminderEnabled={storage.reminder.enabled}
          reminderHour={storage.reminder.hour}
          reminderMinute={storage.reminder.minute}
          onToggleDark={() => storage.setDarkMode(d => !d)}
          onToggleReminder={handleToggleReminder}
          onOpenReminderTime={() => setShowReminderTime(true)}
          onEditName={() => setShowEditName(true)}
          onPrivacy={() => setShowPrivacy(true)}
          onCrisis={() => setShowCrisis(true)}
          onAbout={() => setShowAbout(true)}
        />
      )}

      <BottomNav current={page} onSwitch={setPage} />

      {showRecord && (
        <RecordModal
          card={card}
          messages={chat.filterRecordMessages()}
          userName={storage.userName}
          onCancel={() => setShowRecord(false)}
          onSaved={item => storage.setJournal(j => [item, ...j])}
          onFinish={() => {
            setShowRecord(false)
            setPage('home')
            chat.clearChat()
          }}
          onShare={() => setShowShareCard(true)}
          onShareAfterSave={() => setShowShareCard(true)}
        />
      )}

      {showShareCard && <ShareCardModal card={card} onClose={() => setShowShareCard(false)} />}
      {showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}
      {showHug && (
        <HugModal
          message={HUG_MESSAGES[hugIdx]}
          onNextMessage={() => setHugIdx(i => (i + 1) % HUG_MESSAGES.length)}
          onClose={() => setShowHug(false)}
        />
      )}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showEditName && (
        <EditNameModal
          userName={storage.userName}
          onClose={() => setShowEditName(false)}
          onSave={name => storage.setUserName(name)}
        />
      )}
      {editJournalItem && (
        <JournalEditModal
          item={editJournalItem}
          onCancel={() => setEditJournalItem(null)}
          onSave={patch => {
            storage.updateJournalItem(editJournalItem.id, patch)
            setEditJournalItem(null)
          }}
        />
      )}
      {showQuickCheckIn && (
        <QuickCheckInModal
          onCancel={() => setShowQuickCheckIn(false)}
          onSaved={handleQuickCheckInSaved}
        />
      )}
      {showReminderTime && (
        <ReminderTimeModal
          hour={storage.reminder.hour}
          minute={storage.reminder.minute}
          onClose={() => setShowReminderTime(false)}
          onSave={handleSaveReminderTime}
        />
      )}
    </div>
  )
}
