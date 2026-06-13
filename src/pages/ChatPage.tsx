import type { RefObject } from 'react'
import { ArrowLeft, Sparkles, Wind } from 'lucide-react'
import { OTTER_CURIOUS } from '../assets'
import { QUICK_REPLIES } from '../constants/chat'
import type { CardData, ChatMsg } from '../types'

type ChatPageProps = {
  card: CardData
  msgs: ChatMsg[]
  input: string
  typing: boolean
  otterMood: string
  canFinishChat: boolean
  showFinishRow: boolean
  chatError: 'open' | 'send' | null
  showTip: boolean
  tipText: string
  endRef: RefObject<HTMLDivElement | null>
  onBack: () => void
  onInputChange: (value: string) => void
  onSend: () => void
  onQuickReply: (text: string) => void
  onFinishChat: () => void
  onGenerateRecord: () => void
  onRetry: () => void
  onBreathing: () => void
}

export function ChatPage({
  card,
  msgs,
  input,
  typing,
  otterMood,
  canFinishChat,
  showFinishRow,
  chatError,
  showTip,
  tipText,
  endRef,
  onBack,
  onInputChange,
  onSend,
  onQuickReply,
  onFinishChat,
  onGenerateRecord,
  onRetry,
  onBreathing,
}: ChatPageProps) {
  return (
    <div className="chat-page page-enter">
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowLeft size={20} strokeWidth={2} style={{ cursor: 'pointer' }} onClick={onBack} />
        </div>
        <div className="chat-header-card" onClick={onBack}>
          <img decoding="async" src={card.cardImg} alt={card.word} className="card-thumb card-thumb--sm" />
          <span style={{ fontWeight: 600 }}>{card.word}</span>
        </div>
        <button
          type="button"
          onClick={onBreathing}
          aria-label="呼吸练习"
          style={{
            background: 'rgba(167,197,189,0.25)', border: 'none', borderRadius: '50%',
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-dark)', flexShrink: 0,
          }}
        >
          <Wind size={18} strokeWidth={2} />
        </button>
        <img
          decoding="async"
          src={otterMood}
          alt="念念"
          style={{
            width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(201,168,130,0.3)',
          }}
        />
      </div>
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`msg-wrap ${m.role === 'user' ? 'user' : ''}`}>
            {m.role === 'ai' && <img decoding="async" src={otterMood} alt="念念" className="msg-otter-sm" />}
            <div className={`msg-bubble ${m.role === 'ai' ? 'ai' : 'user-msg'}`}>{m.text}</div>
          </div>
        ))}
        {typing && (
          <div className="msg-wrap">
            <img decoding="async" src={OTTER_CURIOUS} alt="念念" className="msg-otter-sm" />
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}
        {canFinishChat && showFinishRow && !typing && (
          <div className="chat-finish-row">
            <button type="button" className="btn-ghost chat-finish-btn" onClick={onFinishChat}>今天先到这里</button>
            <button type="button" className="btn-primary chat-finish-btn" onClick={onGenerateRecord}>
              <Sparkles size={14} strokeWidth={2} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {' '}
              生成今日觉察
            </button>
          </div>
        )}
        {chatError && !typing && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button type="button" className="btn-ghost chat-retry-btn" onClick={onRetry}>再试一次</button>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-compose">
        {showTip && <div className="otter-tip-bubble">{tipText}</div>}
        {msgs.length <= 2 && !typing && (
          <div className="chat-quick-replies">
            {QUICK_REPLIES.map(q => (
              <button
                key={q}
                type="button"
                className="tag-chip chat-quick-chip"
                onClick={() => onQuickReply(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div className="chat-input-bar">
          <input
            className="chat-input"
            placeholder="慢慢来，我在听……"
            value={input}
            disabled={typing}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !typing && onSend()}
          />
          <button
            className="chat-send"
            onClick={onSend}
            disabled={typing || !input.trim()}
            style={{ opacity: typing || !input.trim() ? 0.45 : 1 }}
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
