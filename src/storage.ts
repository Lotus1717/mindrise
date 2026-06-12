// 原生存储封装：Capacitor 环境用 Preferences，Web 环境回退 localStorage
// iOS 上的 WebView localStorage 可能被系统清理，Preferences 写入原生沙盒不会被清

const useNative = typeof (window as Window & { Capacitor?: unknown }).Capacitor !== 'undefined'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nativeSet: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let nativeGet: any

if (useNative) {
  import('@capacitor/preferences').then(m => {
    nativeSet = m.Preferences.set
    nativeGet = m.Preferences.get
  })
}

export async function storageGet<T = string>(key: string): Promise<T | null> {
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
  if (nativeSet) {
    await nativeSet({ key, value: JSON.stringify(val) })
  } else {
    localStorage.setItem(key, JSON.stringify(val))
  }
}
