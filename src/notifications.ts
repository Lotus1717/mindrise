import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { LocalNotificationSchema } from '@capacitor/local-notifications'
import { requestIosNotificationPermission, scheduleIosDailyReminder, cancelIosDailyReminder, checkIosNotificationPermission } from './native/reminderPermission'
import { storageGet, storageSet } from './storage'
import type { ReminderSettings } from './types'

const STORAGE_KEY = 'mindrise-reminder'
const NOTIFICATION_ID = 1001
const REMINDER_CHANNEL_ID = 'mindrise-reminder'
const DEFAULT: ReminderSettings = { enabled: false, hour: 20, minute: 0 }

export type ReminderPermission = 'granted' | 'denied' | 'unsupported'
export type ReminderWarning = 'permission_denied' | 'schedule_failed' | 'unsupported' | 'exact_alarm_denied'

export type ReminderSaveResult =
  | { ok: true; warning?: ReminderWarning }
  | { ok: false; reason: ReminderWarning }

type LocalNotificationsPlugin = typeof LocalNotifications

let localNotificationsModule: Promise<LocalNotificationsPlugin> | null = null

function loadLocalNotificationsModule() {
  return Promise.resolve(LocalNotifications)
}

async function getLocalNotifications() {
  if (!localNotificationsModule) {
    localNotificationsModule = loadLocalNotificationsModule()
  }
  return localNotificationsModule
}

/** App 启动时预热插件，避免首次点击时 dynamic import 拖出 iOS 用户手势窗口 */
export function preloadNotificationModule(): void {
  if (Capacitor.isNativePlatform()) void getLocalNotifications()
}

export async function loadReminderSettings(): Promise<ReminderSettings> {
  const stored = await storageGet<ReminderSettings>(STORAGE_KEY)
  return stored ? { ...DEFAULT, ...stored } : DEFAULT
}

export async function persistReminderPreference(settings: ReminderSettings): Promise<void> {
  await storageSet(STORAGE_KEY, settings)
}

/** 启动 / 回前台时：已有权限则补注册通知 */
export async function syncReminderIfNeeded(settings: ReminderSettings): Promise<void> {
  if (!settings.enabled || !Capacitor.isNativePlatform()) return
  try {
    if (Capacitor.getPlatform() === 'ios') {
      const status = await checkIosNotificationPermission()
      if (status !== 'granted') return
    } else {
      const LocalNotifications = await getLocalNotifications()
      const perm = await LocalNotifications.checkPermissions()
      if (perm.display !== 'granted') return
    }
    await scheduleDailyReminder(settings.hour, settings.minute)
  } catch (err) {
    console.warn('[notifications] startup sync', err)
  }
}

export async function syncReminderToNative(
  settings: ReminderSettings,
  opts?: { skipPermission?: boolean },
): Promise<ReminderSaveResult> {
  if (!settings.enabled) {
    await cancelDailyReminder()
    return { ok: true }
  }
  if (!Capacitor.isNativePlatform()) {
    return { ok: true, warning: 'unsupported' }
  }

  if (!opts?.skipPermission) {
    const permission = await ensureNotificationPermission()
    if (permission !== 'granted') {
      return {
        ok: true,
        warning: permission === 'unsupported' ? 'unsupported' : 'permission_denied',
      }
    }
  }

  const exactAlarmWarning = await ensureExactAlarmIfNeeded()

  const scheduled = await scheduleDailyReminder(settings.hour, settings.minute)
  if (!scheduled) {
    return { ok: true, warning: 'schedule_failed' }
  }

  return exactAlarmWarning ? { ok: true, warning: exactAlarmWarning } : { ok: true }
}

export async function saveReminderSettings(settings: ReminderSettings): Promise<ReminderSaveResult> {
  await persistReminderPreference(settings)
  return syncReminderToNative(settings)
}

/** @deprecated 使用 ensureNotificationPermission */
export async function requestNotificationPermission(): Promise<boolean> {
  return (await ensureNotificationPermission()) === 'granted'
}

export async function checkNotificationPermission(): Promise<ReminderPermission | 'prompt'> {
  if (!Capacitor.isNativePlatform()) return 'unsupported'
  if (Capacitor.getPlatform() === 'ios') {
    return checkIosNotificationPermission()
  }
  try {
    const LocalNotifications = await getLocalNotifications()
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'granted') return 'granted'
    if (perm.display === 'denied') return 'denied'
    return 'prompt'
  } catch (err) {
    console.warn('[notifications] check permission', err)
    return 'denied'
  }
}

export async function ensureNotificationPermission(): Promise<ReminderPermission> {
  if (!Capacitor.isNativePlatform()) return 'unsupported'

  // iOS：专用原生插件直接调 UNUserNotificationCenter（Capacitor LocalNotifications 桥接不可靠）
  if (Capacitor.getPlatform() === 'ios') {
    const granted = await requestIosNotificationPermission()
    return granted === 'granted' ? 'granted' : 'denied'
  }

  try {
    const LocalNotifications = await getLocalNotifications()
    const perm = await LocalNotifications.checkPermissions()
    if (perm.display === 'granted') return 'granted'
    const requested = await LocalNotifications.requestPermissions()
    return requested.display === 'granted' ? 'granted' : 'denied'
  } catch (err) {
    console.warn('[notifications] permission', err)
    return 'denied'
  }
}

async function ensureReminderChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    const LocalNotifications = await getLocalNotifications()
    await LocalNotifications.createChannel({
      id: REMINDER_CHANNEL_ID,
      name: '每日觉察提醒',
      description: '念念会在你设定的时间提醒你来觉察',
      importance: 4,
      vibration: true,
    })
  } catch (err) {
    console.warn('[notifications] channel', err)
  }
}

/** Android 12+ 精确闹钟：没有则提醒可能大幅延迟 */
async function ensureExactAlarmIfNeeded(): Promise<ReminderWarning | undefined> {
  if (Capacitor.getPlatform() !== 'android') return undefined
  try {
    const LocalNotifications = await getLocalNotifications()
    const setting = await LocalNotifications.checkExactNotificationSetting()
    if (setting.exact_alarm === 'granted') return undefined
    await LocalNotifications.changeExactNotificationSetting()
    const after = await LocalNotifications.checkExactNotificationSetting()
    if (after.exact_alarm !== 'granted') return 'exact_alarm_denied'
  } catch (err) {
    console.warn('[notifications] exact alarm', err)
  }
  return undefined
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false

  if (Capacitor.getPlatform() === 'ios') {
    return scheduleIosDailyReminder(hour, minute)
  }

  try {
    const LocalNotifications = await getLocalNotifications()
    await ensureReminderChannel()
    await cancelDailyReminder()

    const notification: LocalNotificationSchema = {
      id: NOTIFICATION_ID,
      title: '念起 · 念念在等你',
      body: '今天抽一张情绪卡，和念念聊聊也好，静一静也好。',
      schedule: {
        on: { hour, minute },
        allowWhileIdle: true,
      },
    }

    if (Capacitor.getPlatform() === 'android') {
      notification.channelId = REMINDER_CHANNEL_ID
      notification.smallIcon = 'ic_launcher_foreground'
    }

    await LocalNotifications.schedule({ notifications: [notification] })

    const pending = await LocalNotifications.getPending()
    return pending.notifications.some(n => n.id === NOTIFICATION_ID)
  } catch (err) {
    console.warn('[notifications] schedule', err)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  if (Capacitor.getPlatform() === 'ios') {
    await cancelIosDailyReminder()
    return
  }

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

function notificationSettingsHint(): string {
  if (Capacitor.getPlatform() === 'android') {
    return '请在系统「设置 → 应用 → 念起 → 通知」中允许通知，然后再打开提醒。'
  }
  return '请在 iPhone「设置 → 念起 → 通知」中允许通知，然后再打开提醒。'
}

export function reminderFailureMessage(reason: ReminderWarning): string {
  switch (reason) {
    case 'unsupported':
      return '每日提醒仅在念起 App 内生效。'
    case 'permission_denied':
      return notificationSettingsHint()
    case 'schedule_failed':
      return '提醒设置失败，请稍后再试。'
    case 'exact_alarm_denied':
      return '提醒已保存，但系统未允许精确闹钟，推送时间可能不准确。请在系统设置中为念起开启「闹钟和提醒」。'
    default:
      return '提醒设置失败，请稍后再试。'
  }
}

export function reminderWarningMessage(warning: ReminderWarning): string {
  switch (warning) {
    case 'unsupported':
      return '已为你记下提醒偏好。实际推送需要在念起 App 里开启。'
    case 'permission_denied':
      return Capacitor.getPlatform() === 'ios'
        ? '未能获取通知权限。若系统未弹出授权框，请到 iPhone「设置 → 念起 → 通知」手动开启；若设置里没有「通知」选项，请删除 App 后重新安装再试。'
        : `提醒已打开。${notificationSettingsHint()}`
    case 'schedule_failed':
      return '提醒偏好已保存，但系统调度失败。你可以改一下提醒时间再试。'
    case 'exact_alarm_denied':
      return '提醒已开启，但系统未允许精确闹钟，推送可能延迟。请在「设置 → 应用 → 念起 → 闹钟和提醒」中开启。'
    default:
      return '提醒偏好已保存，但暂时无法推送到系统。'
  }
}
