import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import './index.css'
import { storageGet, storageSet } from './storage'
import { CARDS, HUG_MESSAGES, emotionTags } from './data'
import {
  OTTER_DEFAULT, OTTER_CURIOUS, OTTER_GLOW,
  SPLASH_FRAMES, ONBOARD_STEPS, SHARE_BG, LOGO_48,
} from './assets'
import { preloadImage, preloadImages, preloadImagesIdle } from './preload'
import {
  Home, BookOpen, User, Share2, Moon, Sun,
  Calendar, Sparkles, Heart, Info, ArrowLeft,
} from 'lucide-react'

type Page = 'splash' | 'home' | 'chat' | 'journal' | 'profile' | 'onboard'

type JournalItem = {
  id: string
  date: string
  day: string
  emotion: string
  rating: number
  tags: string[]
  summary: string
  cardImg: string
  ts: number
}

const CARD_COLORS: Record<string,string> = {
  '焦虑':'#E8B4A2','疲惫':'#C9A882','愤怒':'#C97A6A','平静':'#A7C5BD',
  '欣喜':'#FFE5B4','孤独':'#8E7A72','感恩':'#D4A8A0','迷茫':'#9BAEC8',
  '期待':'#B8D4C8','释然':'#C8C8A8',
}
// 情绪字母标识（彩色圆圈内显示首字）
const EMOTION_LETTERS: Record<string,string> = {
  '焦虑':'焦','疲惫':'疲','愤怒':'怒','平静':'平','欣喜':'欣',
  '孤独':'孤','感恩':'恩','迷茫':'茫','期待':'期','释然':'释',
}
const SOCRATIC: Record<string,string[]> = {
  '焦虑':['你感到焦虑时，身体哪个部位最紧绷？','那股紧绷感像什么形状？有多大？','如果焦虑是一个声音，它在说什么？','深呼吸，那团能量现在变了吗？','这个焦虑要保护你远离什么？'],
  '疲惫':['你的身体在告诉你什么？','最近有没有好好休息过？','如果给自己放半天假，你最想做什么？','那种疲惫里，有没有藏着一点点委屈？','你上一次什么都不做是什么时候？'],
  '愤怒':['是什么触发了这团愤怒？','愤怒在保护你的哪条边界？','如果愤怒有颜色，它会是什么？','这团愤怒想让你做什么？','当你允许自己愤怒时，最害怕什么？'],
  '平静':['这份平静，是什么时候开始的？','这种感觉，以前什么时候有过？','是什么带给你这份平静？','如果你能把这份感觉收藏起来，你会放在哪里？','此刻最让你满足的是什么？'],
  '孤独':['你感觉到孤独时，最想谁在身边？','这份孤独，是新朋友还没出现，还是旧的人在远去？','有没有某个时刻，孤独感突然消失了？','如果你可以给自己一段陪伴，你会说什么？','一个人待着时，最害怕什么声音？'],
  '欣喜':['今天有什么具体的事让你这么开心？','这份开心，你想和谁分享？','上一次这么开心是什么时候？','有什么还没来得及庆祝的小事？','这种感觉，你能用什么方式留住它？'],
  '感恩':['今天你想感谢的第一件事是什么？','有什么人，你很久没说谢谢了？','有没有一件小事，你原本以为理所当然？','如果要给今天写一句感恩的话，你会写什么？','你收到的善意里，哪一份最让你印象深刻？'],
  '迷茫':['这种迷茫感，是来自选择太多，还是方向不清晰？','如果有一个人能给你指路，你最想问什么？','你内心深处真正想要的是什么？','有什么声音，是你在强迫自己忽略的？','如果把迷茫画成一幅画，你会画什么？'],
  '期待':['你在期待的那件事，对你意味着什么？','如果它实现了，你的生活会有什么不同？','现在可以做什么，让这个期待更近一步？','有什么恐惧，是藏在期待背后的？','你上一次对未来充满希望是什么时候？'],
  '释然':['是什么让你放下了？','那个放下的瞬间，是什么感觉？','有什么东西，是你终于可以不再紧握的？','这份释然花了多长时间？','你愿意给自己时间吗？'],
}
const GUIDANCE = ['慢慢来，我在这里。','你的感受很重要，试着描述它。','呼吸，感受这个时刻。','对自己温柔一点。','这个感受，没有对错。']
const MAX_MSGS = 50
const MOOD_EMOJI = ['', '😣', '😔', '😐', '🙂', '💛']
const MOOD_LABELS = ['', '低落', '不好', '还好', '不错', '超棒']

function RecordModal({ card, onClose, onSave }: { card: typeof CARDS[0]; onClose: () => void; onSave: (item: JournalItem) => void }) {
  const [rating, setRating] = useState(0)
  const [selTags, setSelTags] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const savingRef = useRef(false)
  const defaultSummary = `今天，我在「念起」与念念一起完成了一次情绪觉察。我感受到的是「${card.word}」——${card.guide} 这个时刻，值得被记住。`
  const handleSave = useCallback(() => {
    if (savingRef.current) return
    savingRef.current = true
    const now = new Date()
    const item: JournalItem = {
      id: String(Date.now()),
      date: `${now.getMonth()+1}月${now.getDate()}日`,
      day: ['周日','周一','周二','周三','周四','周五','周六'][now.getDay()],
      emotion: card.word,
      rating,
      tags: selTags,
      summary: summary || defaultSummary,
      cardImg: card.cardImg,
      ts: now.getTime(),
    }
    onSave(item)
    setSaved(true)
    const id = setTimeout(onClose, 1800)
    return () => clearTimeout(id)
  }, [rating, selTags, summary, defaultSummary, card, onSave, onClose])
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        {!saved ? (
          <>
            <div className="modal-title"><Sparkles size={16} strokeWidth={2} style={{marginRight:6,verticalAlign:'middle'}}/> 今日觉察</div>
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ position:'relative', flexShrink:0 }}>
                <img decoding="async" src={card.cardImg} alt={card.word} style={{ width:70, height:94, objectFit:'cover', borderRadius:14 }} loading="lazy" />
                <div style={{ position:'absolute',bottom:-6,right:-6,width:22,height:22,borderRadius:'50%',background:CARD_COLORS[card.word],display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',textShadow:'0 1px 2px rgba(0,0,0,0.2)' }}>{EMOTION_LETTERS[card.word]}</div>
              </div>
              <div>
                <div style={{ fontWeight:700,fontSize:20,color:'var(--text-dark)',marginBottom:4 }}>{card.word}</div>
                <div style={{ fontSize:12,color:'var(--text-muted)',lineHeight:1.6 }}>{card.guide}</div>
              </div>
            </div>
            <div style={{ fontSize:13,color:'var(--text-muted)',marginBottom:6 }}>这段觉察：</div>
            <div className="record-summary">
              {editing ? (
                <textarea value={summary||defaultSummary} onChange={e=>setSummary(e.target.value)} onBlur={()=>setEditing(false)} autoFocus style={{ width:'100%',minHeight:80,border:'none',outline:'none',background:'transparent',fontSize:14,lineHeight:1.7,color:'var(--text-dark)',resize:'none',fontFamily:'inherit' }} />
              ) : <div onClick={()=>setEditing(true)} style={{ cursor:'text' }}>{summary||defaultSummary}</div>}
            </div>
            <div style={{ fontSize:13,color:'var(--text-muted)',marginBottom:8 }}>{rating ? `心情：${MOOD_EMOJI[rating]} ${MOOD_LABELS[rating]}` : '选一颗心情，代表今天的状态 →'}</div>
            <div className="rating-row">{[1,2,3,4,5].map(n=><button key={n} className={`rating-btn emoji ${rating===n?'selected-emoji':''}`} style={{opacity:rating&&rating!==n?0.35:1}} onClick={()=>setRating(rating===n?0:n)}>{MOOD_EMOJI[n]}</button>)}</div>
            <div style={{ fontSize:13,color:'var(--text-muted)',marginBottom:8 }}>情绪标签：</div>
            <div className="record-tags">{emotionTags.map(t=><div key={t} className={`tag-chip ${selTags.includes(t)?'selected':''}`} onClick={()=>setSelTags(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t])}>{t}</div>)}</div>
            <button className="btn-save" onClick={handleSave} style={{ opacity:1 }}>保存到日记</button>
            <button className="btn-share" onClick={onClose}>取消</button>
          </>
        ) : (
          <div style={{ textAlign:'center',padding:'24px 0' }}>
            <div style={{ position:'relative',display:'inline-block' }}>
              <img decoding="async" loading="lazy" src={OTTER_GLOW} alt="念念" style={{ width:110,height:110,borderRadius:'50%',objectFit:'cover',animation:'savePop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }} />
              <div className="stone-flash" />
            </div>
            <div style={{ fontSize:20,fontWeight:700,color:'var(--text-dark)',marginTop:20 }}>念念已收到 💛</div>
            <div style={{ fontSize:14,color:'var(--text-muted)',marginTop:10,lineHeight:1.8 }}>你的觉察已保存<br />每一次觉察，都是一次成长。</div>
          </div>
        )}
      </div>
    </div>
  )
}

function ShareModal({ card, onClose }: { card: typeof CARDS[0]; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const splashIdxRef = useRef(-1)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (splashIdxRef.current < 0) splashIdxRef.current = Math.floor(Math.random() * SPLASH_FRAMES.length)
    const splashPick = splashIdxRef.current
    const ctx = c.getContext('2d')!
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const W = 750, H = 1100
    c.width = W * dpr; c.height = H * dpr
    ctx.scale(dpr, dpr)

    // 背景
    const bg = new Image(); bg.crossOrigin = 'anonymous'; bg.src = SHARE_BG
    bg.onload = () => {
      ctx.drawImage(bg, 0, 0, W, H)

      // Hero 图：随机 splash 帧
      const hero = new Image(); hero.crossOrigin = 'anonymous'; hero.src = SPLASH_FRAMES[splashPick]
      hero.onload = () => {
        const heroW = 480, heroH = 400, heroX = (W - heroW) / 2, heroY = 70, heroR = 24
        // 圆角裁剪
        ctx.save()
        ctx.beginPath(); ctx.moveTo(heroX + heroR, heroY)
        ctx.lineTo(heroX + heroW - heroR, heroY); ctx.quadraticCurveTo(heroX + heroW, heroY, heroX + heroW, heroY + heroR)
        ctx.lineTo(heroX + heroW, heroY + heroH - heroR); ctx.quadraticCurveTo(heroX + heroW, heroY + heroH, heroX + heroW - heroR, heroY + heroH)
        ctx.lineTo(heroX + heroR, heroY + heroH); ctx.quadraticCurveTo(heroX, heroY + heroH, heroX, heroY + heroH - heroR)
        ctx.lineTo(heroX, heroY + heroR); ctx.quadraticCurveTo(heroX, heroY, heroX + heroR, heroY)
        ctx.closePath(); ctx.clip()
        ctx.drawImage(hero, heroX, heroY, heroW, heroH)
        // 情绪色叠加
        ctx.fillStyle = `${CARD_COLORS[card.word] || '#C8A882'}66`
        ctx.fillRect(heroX, heroY, heroW, heroH)
        ctx.restore()

        // 情绪词叠加在 hero 上
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 52px "PingFang SC",-apple-system,sans-serif'
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowBlur = 8
        ctx.fillText(card.word, W / 2, heroY + heroH / 2 + 14)
        ctx.shadowBlur = 0

        // Logo 水印在 hero 右上角
        const logoImg = new Image(); logoImg.crossOrigin = 'anonymous'; logoImg.src = LOGO_48
        logoImg.onload = () => {
          ctx.save()
          ctx.globalAlpha = 0.7
          ctx.drawImage(logoImg, heroX + heroW - 56, heroY + 12, 40, 40)
          ctx.restore()

          // 引导语（自动换行）
          const guideY = heroY + heroH + 44
          ctx.fillStyle = '#3C2E2B'
          ctx.font = '28px "PingFang SC",-apple-system,sans-serif'
          ctx.textAlign = 'center'
          const maxWidth = 560
          const guideText = card.guide
          const words = guideText.split('')
          let line = ''; const lines: string[] = []
          for (const ch of words) {
            const test = line + ch
            if (ctx.measureText(test).width > maxWidth) {
              lines.push(line); line = ch
            } else {
              line = test
            }
          }
          if (line) lines.push(line)
          lines.forEach((l, i) => {
            ctx.fillText(l, W / 2, guideY + i * 44)
          })

          // 心情标记
          const moodY = guideY + lines.length * 44 + 40
          ctx.font = '22px "PingFang SC",-apple-system,sans-serif'
          ctx.fillStyle = '#8E7A72'
          ctx.fillText('觉察 · 念起', W / 2, moodY)

          // 底部水獭 + 品牌
          const ot = new Image(); ot.crossOrigin = 'anonymous'; ot.src = OTTER_GLOW
          ot.onload = () => {
            const otY = Math.max(moodY + 50, H - 230)
            ctx.drawImage(ot, W / 2 - 50, otY, 100, 100)
            ctx.fillStyle = '#B8926C'; ctx.font = 'bold 26px "PingFang SC",-apple-system,sans-serif'
            ctx.fillText('念起 · 觉察即自由', W / 2, otY + 130)
            ctx.fillStyle = '#8E7A72'; ctx.font = '18px "PingFang SC",-apple-system,sans-serif'
            ctx.fillText('念念陪你每一次觉察', W / 2, otY + 160)
          }
        }
      }
    }
  }, [card])
  const handle = useCallback(async () => {
    const c = ref.current
    if (!c) return
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void>; canShare?: (data: ShareData) => boolean }
    try {
      const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png'))
      if (blob && nav.share && nav.canShare?.({ files: [new File([blob], 'share.png', { type: 'image/png' })] })) {
        const file = new File([blob], `念起觉察_${card.word}.png`, { type: 'image/png' })
        await nav.share({ title: `念起觉察 · ${card.word}`, files: [file] })
        return
      }
    } catch {
      // Share API not available or user cancelled — fall through to download
    }
    const a = document.createElement('a')
    a.download = `念起觉察_${card.word}.png`; a.href = c.toDataURL('image/png'); a.click()
  }, [card])
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{ maxWidth:420,margin:'0 auto',transform:'translateY(0)',borderRadius:'28px 28px 0 0' }}>
        <div className="modal-title"><Sparkles size={16} strokeWidth={2} style={{marginRight:6,verticalAlign:'middle'}}/> 分享你的觉察</div>
        <div style={{ background:'#FEF9F0',borderRadius:20,padding:16,marginBottom:16,display:'flex',justifyContent:'center' }}>
          <canvas ref={ref} style={{ width:'100%',maxWidth:300,borderRadius:16,boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }} />
        </div>
        <button className="btn-save" onClick={handle}>保存到相册</button>
        <button className="btn-share" onClick={onClose}>取消</button>
      </div>
    </div>
  )
}

function BottomNav({ current, onSwitch }: { current: Page; onSwitch: (p: Page) => void }) {
  if (current==='splash'||current==='chat'||current==='onboard') return null
  return (
    <div className="bottom-nav">
      {[
        {Icon:Home,label:'首页',key:'home' as Page},
        {Icon:BookOpen,label:'日记本',key:'journal' as Page},
        {Icon:User,label:'我的',key:'profile' as Page},
      ].map(item=>(
        <div key={item.key} className={`nav-item ${current===item.key?'active':''}`} onClick={()=>onSwitch(item.key)}>
          <div className="nav-icon"><item.Icon size={20} strokeWidth={2} /></div>
          <div className="nav-label">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('splash')
  const [cardIdx, setCardIdx] = useState(0)
  const [msgs, setMsgs] = useState<{role:'ai'|'user';text:string}[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [showRecord, setShowRecord] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showHug, setShowHug] = useState(false)
  const [showEditName, setShowEditName] = useState(false)
  const [hugIdx, setHugIdx] = useState(()=>Math.floor(Math.random()*HUG_MESSAGES.length))
  const [changing, setChanging] = useState(false)
  const splashFrameRef = useRef(0)
  const splashLayerRef = useRef(0)
  const [splashSrcs, setSplashSrcs] = useState<[string, string]>([SPLASH_FRAMES[0], SPLASH_FRAMES[0]])
  const [activeSplashLayer, setActiveSplashLayer] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [tipIdx, setTipIdx] = useState(0)
  const [otterMood, setOtterMood] = useState(OTTER_DEFAULT)
  const [darkMode, setDarkMode] = useState(false)
  const [onboardIdx, setOnboardIdx] = useState(0)
  const [onboarded, setOnboarded] = useState(false)
  const [userName, setUserName] = useState('朋友')
  const [expandedJournal, setExpandedJournal] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<Record<number, {role:'ai'|'user';text:string}[]>>({})
  const [journal, setJournal] = useState<JournalItem[]>([])
  const endRef = useRef<HTMLDivElement>(null)
  const tipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    preloadImages([OTTER_DEFAULT, OTTER_CURIOUS, OTTER_GLOW, CARDS[0].cardImg])
    preloadImagesIdle(CARDS.map(c => c.cardImg))
    preloadImagesIdle(ONBOARD_STEPS.map(s => s.img))
    preloadImagesIdle(SPLASH_FRAMES)
  }, [])

  useEffect(() => {
    preloadImage(CARDS[cardIdx].cardImg)
    preloadImage(CARDS[(cardIdx + 1) % CARDS.length].cardImg)
  }, [cardIdx])

  useEffect(() => {
    if (page !== 'splash') return
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
  }, [page])

  useEffect(() => {
    if (page !== 'onboard') return
    preloadImages(ONBOARD_STEPS.map(s => s.img))
    const next = ONBOARD_STEPS[onboardIdx + 1]
    if (next) preloadImage(next.img)
  }, [page, onboardIdx])

  // 从原生存储加载持久化数据
  useEffect(() => {
    (async () => {
      const [dark, name, onboard, j, chat] = await Promise.all([
        storageGet<string>('mindrise-dark'),
        storageGet<string>('mindrise-name'),
        storageGet<string>('nianqi-onboarded'),
        storageGet<JournalItem[]>('mindrise-journal'),
        storageGet<Record<number, {role:'ai'|'user';text:string}[]>>('mindrise-chat'),
      ])
      if (dark !== null) setDarkMode(dark === '1')
      if (name !== null) setUserName(name)
      if (onboard !== null) setOnboarded(true)
      if (j) setJournal(j)
      if (chat) setChatHistory(chat)
    })()
  }, [])

  useEffect(() => { storageSet('mindrise-dark', darkMode?'1':'0') }, [darkMode])
  useEffect(() => { storageSet('mindrise-name', userName) }, [userName])
  useEffect(() => { storageSet('mindrise-journal', journal) }, [journal])
  useEffect(() => { storageSet('mindrise-chat', chatHistory) }, [chatHistory])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing])

  useEffect(() => {
    if (page !== 'chat' || msgs.length === 0) return
    if (tipTimerRef.current) clearTimeout(tipTimerRef.current)
    tipTimerRef.current = setTimeout(() => { setShowTip(true); setTipIdx(Math.floor(Math.random()*GUIDANCE.length)) }, 15000)
    return () => { if (tipTimerRef.current) clearTimeout(tipTimerRef.current) }
  }, [page, msgs.length])

  const startChat = useCallback(() => {
    const card = CARDS[cardIdx]
    const reps = SOCRATIC[card.word] || GUIDANCE
    const existing = chatHistory[cardIdx]
    setMsgs(existing && existing.length > 0 ? existing : [{ role:'ai', text: reps[0] }])
    setOtterMood(OTTER_CURIOUS)
    setShowTip(false)
  }, [cardIdx, chatHistory])

  const handleSend = useCallback(() => {
    if (!input.trim()) return
    const text = input.trim()
    setMsgs(prev => {
      const next: {role:'ai'|'user';text:string}[] = [...prev, { role:'user' as const, text }]
      if (next.length > MAX_MSGS) return next.slice(Math.floor(MAX_MSGS/3))
      return next
    })
    setChatHistory(h => {
      const cur = h[cardIdx] || []
      const next = [...cur, { role:'user' as const, text }].slice(-MAX_MSGS)
      return { ...h, [cardIdx]: next }
    })
    setInput(''); setTyping(true); setShowTip(false)
    if (sendTimerRef.current) clearTimeout(sendTimerRef.current)
    sendTimerRef.current = setTimeout(() => {
      setTyping(false)
      const card = CARDS[cardIdx]
      const reps = SOCRATIC[card.word] || GUIDANCE
      const reply = reps[Math.floor(Math.random()*reps.length)]
      setMsgs(prev => {
        const next: {role:'ai'|'user';text:string}[] = [...prev, { role:'ai' as const, text: reply }]
        if (next.length > MAX_MSGS) return next.slice(Math.floor(MAX_MSGS/3))
        return next
      })
      setChatHistory(h => {
      const cur = h[cardIdx] || []
      const next = [...cur, { role:'ai' as const, text: reply }].slice(-MAX_MSGS)
      return { ...h, [cardIdx]: next }
    })
      setOtterMood(Math.random()>0.4 ? OTTER_CURIOUS : OTTER_DEFAULT)
    }, 1500 + Math.random()*400)
  }, [input, cardIdx])

  const handleNext = useCallback(async () => {
    const nextIdx = (cardIdx + 1) % CARDS.length
    await preloadImage(CARDS[nextIdx].cardImg)
    setChanging(true)
    setTimeout(() => {
      setCardIdx(nextIdx)
      setChanging(false)
    }, 220)
  }, [cardIdx])

  const enterChat = useCallback(() => { setPage('chat'); startChat() }, [startChat])

  const card = CARDS[cardIdx]
  const weekData = useMemo(() => {
    const days = ['日','一','二','三','四','五','六']
    const now = new Date()
    const result: {l:string,v:number,isToday:boolean}[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      d.setHours(0,0,0,0)
      const start = d.getTime()
      const end = start + 86400000
      const dayItems = journal.filter(j => j.ts >= start && j.ts < end)
      const avg = dayItems.length ? dayItems.reduce((s,j) => s + (j.rating||0), 0) / dayItems.length : 0
      result.push({ l: days[d.getDay()], v: avg, isToday: i === 0 })
    }
    return result
  }, [journal])
  const maxV = 5

  if (page === 'splash') {
    return (
      <div className="splash">
        <div className="splash-moon"/><div className="splash-water"/>
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
        <button className="splash-enter" onClick={()=>{
          setPage(onboarded ? 'home' : 'onboard')
        }}>开启觉察之旅</button>
        <div className="splash-disclaimer"><p>「念起」不替代专业心理咨询。如有严重心理困扰，请寻求专业帮助。</p></div>
      </div>
    )
  }

  if (page === 'onboard') {
    const step = ONBOARD_STEPS[onboardIdx]
    return (
      <div className="onboard-page">
        <div className="onboard-img-wrap">
          <img src={step.img} alt={step.title} className="onboard-img" decoding="async" />
        </div>
        <div className="onboard-title">{step.title}</div>
        <div className="onboard-sub">{step.sub}</div>
        <div className="onboard-dots">
          {ONBOARD_STEPS.map((_,i)=><div key={i} className={`onboard-dot ${i===onboardIdx?'active':''}`}/>)}
        </div>
        <div className="onboard-actions">
          {onboardIdx < ONBOARD_STEPS.length-1 ? (
            <><button className="btn-ghost" style={{flex:1}} onClick={()=>{ setOnboarded(true); storageSet('nianqi-onboarded','1'); setPage('home') }}>跳过</button>
               <button className="btn-primary" style={{flex:2}} onClick={()=>setOnboardIdx(i=>i+1)}>继续</button></>
          ) : (
            <button className="btn-primary" style={{flex:1}} onClick={()=>{ setOnboarded(true); storageSet('nianqi-onboarded','1'); setPage('home') }}>开始使用</button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`app-container ${darkMode?'dark-mode':''}`}>
      {page !== 'chat' && (
        <img className="otter-float" src={OTTER_DEFAULT} alt="戳戳念念"
          onClick={()=>{ setShowHug(true); setHugIdx(Math.floor(Math.random()*HUG_MESSAGES.length)) }} />
      )}

      {page === 'home' && (
        <div className="page-enter">
          <div className="status-bar">
            <div className="status-icon" onClick={()=>setDarkMode(d=>!d)}>{darkMode?<Sun size={16} strokeWidth={2}/>:<Moon size={16} strokeWidth={2}/>}</div>
            <span className="status-date">6月11日 周四</span>
            <div className="status-icon" onClick={()=>setPage('journal')}><Calendar size={16} strokeWidth={2}/></div>
          </div>
          <div className="home-page">
            <div className="home-greeting">下午好，{userName}</div>
            <div className={`card-container ${changing?'card-out':'card-in'}`}>
              <div className="emotion-card" onClick={enterChat} style={{cursor:'pointer'}}>
                <div style={{position:'relative',width:'100%',height:215,borderRadius:16,overflow:'hidden',marginBottom:20}}>
                  <img decoding="async" src={card.cardImg} alt={card.word} style={{width:'100%',height:'100%',objectFit:'cover'}} fetchPriority="high" />
                  <div style={{position:'absolute',inset:0,background:`linear-gradient(160deg,${CARD_COLORS[card.word]}cc,${CARD_COLORS[card.word]}99)`,display:'flex',alignItems:'center',justifyContent:'center'}}><div className="card-art-orb"/></div>
                </div>
                <div className="card-emotion-word" style={{letterSpacing:6}}>{card.word}</div>
                <div className="card-guide">{card.guide}</div>
                <div className="card-hint">▼ 点击探索内心</div>
              </div>
            </div>
            <div className="card-actions">
              <button className="btn-primary" onClick={enterChat}>探索这张卡</button>
              <button className="btn-ghost" onClick={handleNext}>换一张</button>
            </div>
          </div>
        </div>
      )}

      {page === 'chat' && (
        <div className="chat-page page-enter">
          <div className="chat-header">
            <div style={{display:'flex',alignItems:'center',gap:4}}><ArrowLeft size={20} strokeWidth={2} style={{cursor:'pointer'}} onClick={()=>setPage('home')}/></div>
            <div className="chat-header-card" onClick={()=>setPage('home')}>
              <img decoding="async" src={card.cardImg} alt={card.word} style={{width:40,height:40,objectFit:'cover',borderRadius:10}} />
              <span style={{fontWeight:600}}>{card.word}</span>
            </div>
            <img decoding="async" src={otterMood} alt="念念" style={{width:40,height:40,borderRadius:'50%',objectFit:'cover',flexShrink:0,boxShadow:'0 2px 8px rgba(201,168,130,0.3)'}} />
          </div>
          <div className="chat-messages">
            {msgs.map((m,i)=>(
              <div key={i} className={`msg-wrap ${m.role==='user'?'user':''}`}>
                {m.role==='ai'&&<img decoding="async" src={otterMood} alt="念念" className="msg-otter-sm"/>}
                <div className={`msg-bubble ${m.role==='ai'?'ai':'user-msg'}`}>{m.text}</div>
              </div>
            ))}
            {typing&&(
              <div className="msg-wrap">
                <img decoding="async" src={OTTER_CURIOUS} alt="念念" className="msg-otter-sm"/>
                <div className="typing-indicator"><div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/></div>
              </div>
            )}
            {msgs.length>=3&&!showRecord&&(
              <div style={{display:'flex',justifyContent:'center',marginTop:8}}>
                <button className="btn-primary" style={{padding:'10px 28px',fontSize:14}} onClick={()=>setShowRecord(true)}><Sparkles size={14} strokeWidth={2} style={{marginRight:4,verticalAlign:'middle'}}/> 生成今日觉察</button>
              </div>
            )}
            <div ref={endRef}/>
          </div>
          {showTip&&(<div className="otter-tip-bubble">{GUIDANCE[tipIdx]}</div>)}
          <div className="chat-input-bar">
            <input className="chat-input" placeholder="慢慢来，我在听……" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()}/>
            <button className="chat-send" onClick={handleSend}>↑</button>
          </div>
        </div>
      )}

      {page === 'journal' && (
        <div className="journal-page page-enter">
          <div className="journal-header">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="status-icon" onClick={()=>setPage('home')} style={{padding:4}}><ArrowLeft size={20} strokeWidth={2}/></div>
              <div style={{fontSize:22,fontWeight:700,color:'var(--text-dark)'}}>日记本</div>
            </div>
            <div className="week-chart">
              <div className="week-chart-title">近7天情绪趋势</div>
              <div style={{display:'flex',alignItems:'flex-end',gap:8,height:64,paddingTop:4}}>
                {weekData.map((d,i)=>{
                  const hasData = d.v > 0
                  const barH = hasData ? Math.max(4, Math.round((d.v/maxV)*54)) : 4
                  return (
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
                    <div title={hasData ? `平均 ${d.v.toFixed(1)} 星` : '无记录'} style={{width:'100%',borderRadius:6,height:barH+'px',background: hasData ? 'linear-gradient(180deg,#F5A87F,#F5A87F40)' : 'rgba(0,0,0,0.06)',transition:'height 0.5s ease',boxShadow: d.isToday && hasData ? '0 0 0 2px rgba(245,168,127,0.4)' : 'none'}}/>
                    <div className="chart-label" style={{fontWeight: d.isToday ? 700 : 400,color: d.isToday ? 'var(--text-dark)' : 'var(--text-muted)'}}>{d.l}</div>
                  </div>
                )})}
              </div>
            </div>
          </div>
          <div className="journal-list">
            {journal.length === 0 ? (
              <div style={{textAlign:'center',padding:'40px 20px',color:'var(--text-muted)',fontSize:13,lineHeight:1.8}}>
                还没有日记。<br/>点首页卡牌 → 探索内心 → 生成今日觉察
              </div>
            ) : journal.map(item=>{
              const isOpen = expandedJournal === item.id
              return (
              <div key={item.id} className="journal-item" onClick={()=>setExpandedJournal(isOpen?null:item.id)} style={{cursor:'pointer'}}>
                <div style={{display:'flex',gap:12,alignItems:'stretch'}}>
                  <div style={{width:5,borderRadius:3,flexShrink:0,background:CARD_COLORS[item.emotion]}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                        <span style={{fontSize:12,fontWeight:600,color:'var(--text-dark)'}}>{item.date} {item.day}</span>
                        <span style={{fontSize:12,padding:'2px 10px',borderRadius:20,background:`${CARD_COLORS[item.emotion]}25`,color:CARD_COLORS[item.emotion],fontWeight:600}}>{item.emotion}</span>
                      </div>
                      <span style={{fontSize:12,color:item.rating?'var(--text-dark)':'var(--text-muted)',letterSpacing:1,flexShrink:0,marginLeft:8}}>
                        {item.rating ? `${MOOD_EMOJI[item.rating]} ${MOOD_LABELS[item.rating]}` : '未评分'}
                      </span>
                    </div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.7,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:isOpen?undefined:2,WebkitBoxOrient:'vertical'}}>{item.summary}</div>
                    {isOpen && (
                      <div style={{marginTop:10,paddingTop:10,borderTop:'1px dashed rgba(0,0,0,0.08)'}}>
                        {item.tags.length>0 && (
                          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
                            {item.tags.map(t=><span key={t} style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:'rgba(0,0,0,0.05)',color:'var(--text-muted)'}}>{t}</span>)}
                          </div>
                        )}
                        {item.cardImg && (
                          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:12,color:'var(--text-muted)'}}>
                            <img decoding="async" src={item.cardImg} alt="" style={{width:36,height:48,objectFit:'cover',borderRadius:8}} loading="lazy"/>
                            <span>来自「{item.emotion}」卡牌</span>
                          </div>
                        )}
                        <div style={{fontSize:11,color:'var(--text-muted)',textAlign:'right',marginTop:8}}>{isOpen?'点击收起 ▲':'点击展开 ▼'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>
      )}

      {page === 'profile' && (
        <div className="profile-page page-enter">
          <div className="status-bar">
            <div className="status-icon" onClick={()=>setPage('home')}><ArrowLeft size={20} strokeWidth={2}/></div>
            <span className="status-date">我的</span>
            <div className="status-icon" onClick={()=>setDarkMode(d=>!d)}>{darkMode?<Sun size={16} strokeWidth={2}/>:<Moon size={16} strokeWidth={2}/>}</div>
          </div>
          <div className="profile-header">
            <div style={{position:'relative',marginBottom:12}}>
              <img decoding="async" loading="lazy" src={OTTER_GLOW} alt="念念" style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',boxShadow:'0 0 30px rgba(255,229,180,0.6)'}}/>
              <div style={{position:'absolute',bottom:-2,right:-2,width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent-warm),var(--accent-green))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',fontWeight:700}}>念</div>
            </div>
            <div className="profile-name">{userName}</div>
            <div className="profile-edit" onClick={()=>setShowEditName(true)} style={{cursor:'pointer'}}>编辑昵称 ›</div>
          </div>
          <button className="profile-hug-btn" onClick={()=>setShowHug(true)}>🤗 抱抱念念</button>
          <div className="profile-list">
            {([
              { Icon:Share2, label:'分享App', onShare:true },
              { Icon:Moon, label:'深色模式', onDark:true },
              { Icon:Info, label:'关于念起', onAbout:true },
            ] as {Icon:React.FC<{size?:number;strokeWidth?:number}>;label:string;onShare?:boolean;onDark?:boolean;onAbout?:boolean}[]).map((item,i)=>(
              <div key={i} className="profile-list-item"
                onClick={()=>{ if (item.onShare) setShowShare(true); if (item.onDark) setDarkMode(d=>!d); if (item.onAbout) setShowAbout(true) }}
                style={{cursor:item.onShare||item.onDark||item.onAbout?'pointer':'default'}}>
                <div className="list-icon"><item.Icon size={18} strokeWidth={2}/></div>
                <div className="list-label">{item.label}</div>
                <div className="list-arrow">›</div>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:24,color:'var(--text-muted)',fontSize:12}}>念起 · 觉察即自由</div>
        </div>
      )}

      <BottomNav current={page} onSwitch={setPage}/>

      {showHug&&(
        <div className="modal-overlay" onClick={()=>setShowHug(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <img decoding="async" src={OTTER_GLOW} alt="念念" style={{width:110,height:110,borderRadius:'50%',objectFit:'cover',boxShadow:'0 0 40px rgba(255,229,180,0.7)',animation:'otterFloat 3s ease-in-out infinite'}}/>
            </div>
            <div className="modal-title"><Heart size={16} strokeWidth={2} style={{marginRight:6,verticalAlign:'middle'}}/> 念念说：</div>
            <div className="hug-message">{HUG_MESSAGES[hugIdx]}</div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setHugIdx(i=>(i+1)%HUG_MESSAGES.length)}>再听一句</button>
              <button className="btn-save" style={{flex:2}} onClick={()=>setShowHug(false)}>谢谢念念 💛</button>
            </div>
          </div>
        </div>
      )}

      {showAbout&&(
        <div className="modal-overlay" onClick={()=>setShowAbout(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{textAlign:'center',padding:'28px 24px'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <img decoding="async" loading="lazy" src={OTTER_GLOW} alt="念起" style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',boxShadow:'0 0 30px rgba(255,229,180,0.6)'}}/>
            </div>
            <div style={{fontSize:22,fontWeight:700,color:'var(--text-dark)',marginBottom:4}}>念起</div>
            <div style={{fontSize:12,color:'var(--text-muted)',letterSpacing:2,marginBottom:18}}>MINDRISE · v1.0</div>
            <div style={{fontSize:14,color:'var(--text-dark)',lineHeight:1.9,textAlign:'left',background:'rgba(0,0,0,0.02)',borderRadius:14,padding:'14px 16px',marginBottom:18}}>
              一只叫念念的小水獭，陪你看见情绪的形状。<br/>
              我们相信，每一次觉察，都是一次温柔的自我靠近。<br/><br/>
              <span style={{color:'var(--text-muted)',fontSize:12}}>「念起」不替代专业心理咨询。如有严重困扰，请寻求专业帮助。</span>
            </div>
            <button className="btn-save" style={{width:'100%'}} onClick={()=>setShowAbout(false)}>知道了</button>
          </div>
        </div>
      )}

      {showEditName&&(
        <div className="modal-overlay" onClick={()=>setShowEditName(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{padding:'24px'}}>
            <div className="modal-title">编辑昵称</div>
            <input
              defaultValue={userName}
              maxLength={12}
              autoFocus
              onKeyDown={e=>{ if (e.key==='Enter') { const v=(e.currentTarget.value||'').trim(); if (v) setUserName(v); setShowEditName(false) } }}
              id="edit-name-input"
              style={{width:'100%',padding:'12px 14px',borderRadius:12,border:'1.5px solid #E8B4A2',fontSize:15,outline:'none',background:'var(--card-bg)',color:'var(--text-dark)',marginBottom:16,boxSizing:'border-box'}}
            />
            <div style={{display:'flex',gap:10}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setShowEditName(false)}>取消</button>
              <button className="btn-save" style={{flex:2}} onClick={()=>{ const v=((document.getElementById('edit-name-input') as HTMLInputElement)?.value||'').trim(); if (v) setUserName(v); setShowEditName(false) }}>保存</button>
            </div>
          </div>
        </div>
      )}

      {showRecord&&<RecordModal card={card} onClose={()=>{ setShowRecord(false); setPage('home'); setMsgs([]) }} onSave={(item)=>setJournal(j=>[item, ...j])}/>}
      {showShare&&<ShareModal card={card} onClose={()=>setShowShare(false)}/>}
    </div>
  )
}