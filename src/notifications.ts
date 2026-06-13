import { Capacitor } from '@capacitor/core'
import type { LocalNotificationSchema } from '@capacitor/local-notifications'
import { storageGet, storageSet } from './storage'
import type { ReminderSettings } from './types'

const STORAGE_KEY = 'mindrise-reminder'
const NOTIFICATION_ID = 1001
const DEFAULT: ReminderSettings = { enabled: false, hour: 20, minute: 0 }

export type ReminderPermission = 'granted' | 'denied' | 'unsupported'
export type ReminderWarning = 'permission_denied' | 'schedule_failed' | 'unsupported'

export type ReminderSaveResult =
  | { ok: true; warning?: ReminderWarning }
  | { ok: false; reason: ReminderWarning }

async function getLocalNotifications() {
  return import('@capacitor/local-notifications').then(m => m.LocalNotifications)
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const stored = await storageGet<ReminderSettings>(STORAGE_KEY)
  return stored ? { ...DEFAULT, ...stored } : DEFAULT
}

export async function persistReminderPreference(settings: ReminderSettings): Promise<void> {
  await storageSet(STORAGE_KEY, settings)
}

/** 启动时仅当已有通知权限时补注册，避免启动就弹权限框 */
export async function syncReminderIfNeeded(settings: ReminderSettings): Promise<void> {
  if (!settings.enabled || !Capacitor.isNativePlatform()) return
  try {
    const LocalNotifications = await getLocalNotifications()
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display !== 'granted') return
    await scheduleDailyReminder(settings.hour, settings.minute)
  } catch (err) {
    console.warn('[notifications] startup sync', err)
  }
}

export async function syncReminderToNative(settings: ReminderSettings): Promise<ReminderSaveResult> {
  if (!settings.enabled) {
    void cancelDailyReminder()
    return { ok: true }
  }
  if (!Capacitor.isNativePlatform()) {
    return { ok: true, warning: 'unsupported' }
  }

  const permission = await ensureNotificationPermission()
  if (permission !== 'granted') {
    return {
      ok: true,
      warning: permission === 'unsupported' ? 'unsupported' : 'permission_denied',
    }
  }

  const scheduled = await scheduleDailyReminder(settings.hour, settings.minute)
  if (!scheduled) {
    return { ok: true, warning: 'schedule_failed' }
  }

  return { ok: true }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<ReminderSaveResult> {
  await persistReminderPreference(settings)
  return syncReminderToNative(settings)
}

/** @deprecated 使用 ensureNotificationPermission */
export async function requestNotificationPermission(): Promise<boolean> {
  return (await ensureNotificationPermission()) === 'granted'
}

export async function ensureNotificationPermission(): Promise<ReminderPermission> {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  try {
    const LocalNotifications = await getLocalNotifications()
    let perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'prompt' || perm.display === 'prompt-with-rationale') {
      perm = await LocalNotifications.requestPermissions()
    }
    return perm.display === 'granted' ? 'granted' : 'denied'
  } catch (err) {
    console.warn('[notifications] permission', err)
    return 'denied'
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  try {
    const LocalNotifications = await getLocalNotifications()
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] })

    const notification: LocalNotificationSchema = {
      id: NOTIFICATION_ID,
      title: '念起 · 念念在等你',
      body: '今天抽一张情绪卡，和念念聊聊也好，静一静也好。',
      schedule: {
        on: { hour, minute },
      },
    }

    if (Capacitor.getPlatform() === 'android') {
      notification.smallIcon = 'ic_launcher_foreground'
    }

    await LocalNotifications.schedule({ notifications: [notification] })
    return true
  } catch (err) {
    console.warn('[notifications] schedule', err)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const LocalNotifications = await getLocalNotifications()
    await Promise.race([
      LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] }),
      new Promise<void>(resolve => setTimeout(resolve, 2500)),
    ])
  } catch (err) {
    console.warn('[notifications] cancel', err)
  }
}

export function reminderFailureMessage(reason: ReminderWarning): string {
  switch (reason) {
    case 'unsupported':
      return '每日提醒仅在念起 App 内生效。'
    case 'permission_denied':
      return '请在 iPhone「设置 → 念起 → 通知」中允许通知，然后再打开提醒。'
    case 'schedule_failed':
      return '提醒设置失败，请稍后再试。'
    default:
      return '提醒设置失败，请稍后再试。'
  }
}

export function reminderWarningMessage(warning: ReminderWarning): string {
  switch (warning) {
    case 'unsupported':
      return '已为你记下提醒偏好。实际推送需要在念起 App 里开启。'
    case 'permission_denied':
      return '提醒已打开。请到 iPhone「设置 → 念起 → 通知」允许通知后才会按时推送。'
    case 'schedule_failed':
      return '提醒偏好已保存，但系统调度失败。你可以改一下提醒时间再试。'
    default:
      return '提醒偏好已保存，但暂时无法推送到系统。'
  }
}
