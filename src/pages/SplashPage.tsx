import { useState, useRef, useEffect } from 'react'
import { SPLASH_FRAMES } from '../assets'
import { SPLASH_FOOTER_NOTE } from '../constants/legal'
import { preloadImage, preloadImages } from '../preload'

type SplashPageProps = {
  onboarded: boolean
  onEnter: (target: 'home' | 'onboard') => void
}

export function SplashPage({ onboarded, onEnter }: SplashPageProps) {
  const splashFrameRef = useRef(0)
  const splashLayerRef = useRef(0)
  const [splashSrcs, setSplashSrcs] = useState<[string, string]>([SPLASH_FRAMES[0], SPLASH_FRAMES[0]])
  const [activeSplashLayer, setActiveSplashLayer] = useState(0)

  useEffect(() => {
    preloadImages(SPLASH_FRAMES)
    const id = setInterval(async () => {
      const next = (splashFrameRef.current + 1) % SPLASH_FRAMES.length
      await preloadImage(SPLASH_FRAMES[next])
      const layer = 1 - splashLayerRef.current
      splashFrameRef.current = next
      splashLayerRef.current = layer
      setSplashSrcs(prev => {
        const n: [string, string] = [...prev]
        n[layer] = SPLASH_FRAMES[next]
        return n
      })
      setActiveSplashLayer(layer)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="splash">
      <div className="splash-moon" />
      <div className="splash-water" />
      <div className="splash-main">
        <div className="splash-otter-wrap">
          {splashSrcs.map((src, i) => (
            <img
              key={i}
              className={`splash-otter ${i === activeSplashLayer ? 'splash-otter-active' : 'splash-otter-inactive'}`}
              src={src}
              alt="念念"
              decoding="async"
            />
          ))}
        </div>
        <div className="splash-brand"><h1>念起</h1><p>觉察即自由</p></div>
        <button className="splash-enter" onClick={() => onEnter(onboarded ? 'home' : 'onboard')}>
          开启觉察之旅
        </button>
      </div>
      <div className="splash-disclaimer">
        <p>{SPLASH_FOOTER_NOTE}</p>
      </div>
    </div>
  )
}
