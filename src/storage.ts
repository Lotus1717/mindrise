// 原生存储封装：Capacitor 环境用 Preferences，Web 环境回退 localStorage
// iOS 上的 WebView localStorage 可能被系统清理，Preferences 写入原生沙盒不会被清

import { Capacitor } from '@capacitor/core'

const useNative = Capacitor.isNativePlatform()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nativeSet: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nativeGet: any

const nativeReady = useNative
  ? import('@capacitor/preferences').then(m => {
      nativeSet = m.Preferences.set
      nativeGet = m.Preferences.get
    })
  : Promise.resolve()

async function ensureStorageReady() {
  await nativeReady
}

export async function storageGet<T = string>(key: string): Promise<T | null> {
  await ensureStorageReady()
  if (nativeGet) {
    const result = await nativeGet({ key })
    if (result?.value !== null && result?.value !== undefined) {
      try { return JSON.parse(result.value) } catch { return result.value as T }
    }
    return null
  }
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}

export async function storageSet(key: string, val: unknown): Promise<void> {
  await ensureStorageReady()
  if (nativeSet) {
    await nativeSet({ key, value: JSON.stringify(val) })
  } else {
    localStorage.setItem(key, JSON.stringify(val))
  }
}
