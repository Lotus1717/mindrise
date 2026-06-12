const envId = import.meta.env.VITE_CLOUDBASE_ENV_ID as string

if (!envId) {
  console.warn('[cloudbase] 未配置 VITE_CLOUDBASE_ENV_ID，对话功能不可用')
}

let app: Awaited<ReturnType<typeof createApp>> | null = null
let authReady: Promise<void> | null = null

async function createApp() {
  const cloudbase = (await import('@cloudbase/js-sdk')).default
  return cloudbase.init({ env: envId })
}

async function getApp() {
  if (!envId) throw new Error('未配置 CloudBase 环境 ID')
  if (!app) app = await createApp()
  return app
}

/** 匿名登录，callFunction 需要有效身份 */
export async function ensureCloudAuth() {
  if (!authReady) {
    authReady = (async () => {
      const tcb = await getApp()
      const auth = tcb.auth()
      if (!(await auth.getLoginState())) {
        await auth.signInAnonymously()
      }
    })()
  }
  return authReady
}

export async function callChatFunction(data: Record<string, unknown>) {
  const tcb = await getApp()
  await ensureCloudAuth()
  return tcb.callFunction({ name: 'nianqi-chat', data })
}
