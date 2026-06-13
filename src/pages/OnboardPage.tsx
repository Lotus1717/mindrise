import { useEffect } from 'react'
import { ONBOARD_STEPS } from '../assets'
import { preloadImage, preloadImages } from '../preload'

type OnboardPageProps = {
  stepIndex: number
  onNext: () => void
  onSkip: () => void
  onComplete: () => void
}

export function OnboardPage({ stepIndex, onNext, onSkip, onComplete }: OnboardPageProps) {
  const step = ONBOARD_STEPS[stepIndex]
  const isLast = stepIndex >= ONBOARD_STEPS.length - 1

  useEffect(() => {
    preloadImages(ONBOARD_STEPS.map(s => s.img))
    const next = ONBOARD_STEPS[stepIndex + 1]
    if (next) preloadImage(next.img)
  }, [stepIndex])

  return (
    <div className="onboard-page">
      <div className="onboard-img-wrap">
        <img src={step.img} alt={step.title} className="onboard-img" decoding="async" />
      </div>
      <div className="onboard-title">{step.title}</div>
      <div className="onboard-sub">{step.sub}</div>
      <div className="onboard-dots">
        {ONBOARD_STEPS.map((_, i) => (
          <div key={i} className={`onboard-dot ${i === stepIndex ? 'active' : ''}`} />
        ))}
      </div>
      <div className="onboard-actions">
        {!isLast ? (
          <>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={onSkip}>跳过</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={onNext}>继续</button>
          </>
        ) : (
          <button className="btn-primary" style={{ flex: 1 }} onClick={onComplete}>开始使用</button>
        )}
      </div>
    </div>
  )
}
