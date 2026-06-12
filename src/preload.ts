const cache = new Map<string, Promise<void>>()

/** 预加载单张图片，已加载过的会复用 Promise。等待完全解码 */
export function preloadImage(src: string): Promise<void> {
  if (!src) return Promise.resolve()
  const hit = cache.get(src)
  if (hit) return hit

  const p = new Promise<void>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      // 强制解码完成，确保 GPU 纹理已生成
      if ('decode' in img && typeof (img.decode) === 'function') {
        img.decode().then(() => resolve()).catch(() => resolve())
      } else {
        resolve()
      }
    }
    img.onerror = () => reject(new Error(`preload failed: ${src}`))
    img.src = src
  })
  cache.set(src, p)
  return p
}

/** 并行预加载多张图片，单张失败不影响其余 */
export function preloadImages(srcs: string[]): Promise<void> {
  return Promise.allSettled(srcs.map(preloadImage)).then(() => {})
}

/** 空闲时预加载，不阻塞首屏 */
export function preloadImagesIdle(srcs: string[]) {
  const run = () => { preloadImages(srcs).catch(() => {}) }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 2500 })
  } else {
    setTimeout(run, 80)
  }
}
