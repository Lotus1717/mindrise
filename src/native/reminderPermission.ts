import { Capacitor } from '@capacitor/core'

type CapacitorBridge = {
  nativePromise?: (plugin: string, method: string, options?: object) => Promise<unknown>
}

function bridge(): CapacitorBridge | undefined {
  return (window as unknown as { Capacitor?: CapacitorBridge }).Capacitor
}

async function nativeCall<T>(plugin: string, method: string, options?: object): Promise<T> {
  const cap = bridge()
  if (!cap?.nativePromise) throw new Error('Capacitor native bridge unavailable')
  return cap.nativePromise(plugin, method, options) as Promise<T>
}

const REMINDER_TITLE = '念起 · 念念在等你'
const REMINDER_BODY = '今天抽一张情绪卡，和念念聊聊也好，静一静也好。'

type PermissionResult = { display: 'granted' | 'denied' | 'prompt' }

export async function checkIosNotificationPermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (Capacitor.getPlatform() !== 'ios') return 'denied'
  try {
    const current = await nativeCall<PermissionResult>('ReminderPermission', 'check')
    if (current.display === 'granted') return 'granted'
    if (current.display === 'denied') return 'denied'
    return 'prompt'
  } catch {
    return 'denied'
  }
}

/** 直接走原生 bridge 请求 iOS 通知权限 */
export async function requestIosNotificationPermission(): Promise<'granted' | 'denied'> {
  if (Capacitor.getPlatform() !== 'ios') return 'denied'
  try {
    const current = await nativeCall<PermissionResult>('ReminderPermission', 'check')
    if (current.display === 'granted') return 'granted'
    if (current.display === 'denied') return 'denied'
    const result = await nativeCall<PermissionResult>('ReminderPermission', 'request')
    return result.display === 'granted' ? 'granted' : 'denied'
  } catch (err) {
    console.warn('[notifications] ios native permission', err)
    return 'denied'
  }
}

export async function scheduleIosDailyReminder(hour: number, minute: number): Promise<boolean> {
  if (Capacitor.getPlatform() !== 'ios') return false
  try {
    await nativeCall('ReminderSchedule', 'scheduleDaily', {
      hour,
      minute,
      title: REMINDER_TITLE,
      body: REMINDER_BODY,
    })
    return true
  } catch (err) {
    console.warn('[notifications] ios native schedule', err)
    return false
  }
}

export async function cancelIosDailyReminder(): Promise<void> {
  if (Capacitor.getPlatform() !== 'ios') return
  try {
    await nativeCall('ReminderSchedule', 'cancelDaily')
  } catch (err) {
    console.warn('[notifications] ios native cancel', err)
  }
}
