const { buildSystemPrompt, buildSummaryPrompt } = require('./prompt')

const BASE_URL = process.env.AI_BASE_URL
  || 'https://tanmycloud-d4gp7dm0l1aeb4fb2.api.tcloudbasegateway.com/v1/ai/cloudbase'
const API_KEY = process.env.AI_API_KEY
const MODEL = process.env.AI_MODEL || 'hy3-preview'

const MAX_MSGS = 50
const MAX_CONTENT = 2000

function clip(text, max) {
  return typeof text === 'string' ? text.slice(0, max) : ''
}

function validate(event) {
  const action = event.action === 'summary' ? 'summary' : 'chat'
  const emotion = clip(event.emotion, 20)
  const guide = clip(event.guide, 500)
  const userName = clip(event.userName, 24) || '朋友'
  if (!emotion || !guide) {
    return { error: '缺少情绪卡信息' }
  }

  const raw = Array.isArray(event.messages) ? event.messages : []
  const messages = raw.slice(-MAX_MSGS).map(m => {
    const role = m.role === 'assistant' ? 'assistant' : 'user'
    const content = clip(m.content, MAX_CONTENT)
    return content ? { role, content } : null
  }).filter(Boolean)

  if (action === 'summary' && messages.length < 2) {
    return { error: '对话太短，无法生成觉察小结' }
  }

  return { action, emotion, guide, userName, messages }
}

async function readStreamReply(res) {
  const reader = res.body?.getReader?.()
  if (!reader) {
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || ''
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('data:')) continue
      const payload = trimmed.slice(5).trim()
      if (!payload || payload === '[DONE]') continue
      try {
        const chunk = JSON.parse(payload)
        const delta = chunk.choices?.[0]?.delta?.content
        if (delta) reply += delta
      } catch {
        // ignore malformed SSE chunk
      }
    }
  }

  return reply.trim()
}

async function callHunyuan(apiMessages, { stream = false, maxTokens = 320, temperature = 0.8 } = {}) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
      stream,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return {
      error: data.message || data.error?.message || `AI 请求失败 (${res.status})`,
      code: data.code,
    }
  }

  const reply = stream ? await readStreamReply(res) : (await res.json()).choices?.[0]?.message?.content?.trim()
  if (!reply) return { error: 'AI 返回为空' }
  return { reply }
}

exports.main = async (event) => {
  try {
    if (!API_KEY) {
      return { error: '云函数未配置 AI_API_KEY，请在 CloudBase 控制台设置环境变量' }
    }

    const parsed = validate(event)
    if (parsed.error) return parsed

    const { action, emotion, guide, userName, messages } = parsed

    if (action === 'summary') {
      const apiMessages = [
        { role: 'system', content: buildSummaryPrompt(emotion, guide, userName) },
        ...messages,
        { role: 'user', content: '请根据以上对话，写一段今日觉察小结。' },
      ]
      return callHunyuan(apiMessages, { maxTokens: 280, temperature: 0.6 })
    }

    const apiMessages = [
      { role: 'system', content: buildSystemPrompt(emotion, guide, userName) },
      ...messages,
    ]

    if (messages.length === 0) {
      apiMessages.push({ role: 'user', content: '念念，我抽到了这张卡，想和你聊聊。' })
    }

    return callHunyuan(apiMessages, { stream: true, maxTokens: 320, temperature: 0.8 })
  } catch (err) {
    console.error('nianqi-chat error', err)
    return { error: err.message || '云函数内部错误' }
  }
}
