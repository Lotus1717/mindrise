import { storageGet, storageSet } from './storage'
import type { ReminderSettings } from './types'

const STORAGE_KEY = 'mindrise-reminder'
const NOTIFICATION_ID = 1001
const DEFAULT: ReminderSettings = { enabled: false, hour: 20, minute: 0 }

const isNative = typeof (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor !== 'undefined'
  && (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

async function getLocalNotifications() {
  return import('@capacitor/local-notifications').then(m => m.LocalNotifications)
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const stored = await storageGet<ReminderSettings>(STORAGE_KEY)
  return stored ? { ...DEFAULT, ...stored } : DEFAULT
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<void> {
  await storageSet(STORAGE_KEY, settings)
  if (settings.enabled) {
    await scheduleDailyReminder(settings.hour, settings.minute)
  } else {
    await cancelDailyReminder()
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) return false
  try {
    const LocalNotifications = await getLocalNotifications()
    const perm = await LocalNotifications.requestPermissions()
    return perm.display === 'granted'
  } catch {
    return false
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!isNative) return false
  try {
    const LocalNotifications = await getLocalNotifications()
    const perm = await LocalNotifications.requestPermissions()
    if (perm.display !== 'granted') return false

    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] })

    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)
    if (first.getTime() <= now.getTime()) first.setDate(first.getDate() + 1)

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIFICATION_ID,
        title: '念起 · 念念在等你',
        body: '今天抽一张情绪卡，和念念聊聊也好，静一静也好。',
        schedule: {
          at: first,
          repeats: true,
          every: 'day',
        },
        sound: undefined,
        smallIcon: 'ic_launcher_foreground',
      }],
    })
    return true
  } catch (err) {
    console.warn('[notifications]', err)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isNative) return
  try {
    const LocalNotifications = await getLocalNotifications()
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] })
  } catch {
    // ignore
  }
}
