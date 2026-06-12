const { buildSystemPrompt } = require('./prompt')

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

  return { emotion, guide, userName, messages }
}

exports.main = async (event) => {
  try {
    if (!API_KEY) {
      return { error: '云函数未配置 AI_API_KEY，请在 CloudBase 控制台设置环境变量' }
    }

    const parsed = validate(event)
    if (parsed.error) return parsed

    const { emotion, guide, userName, messages } = parsed

    const apiMessages = [
      { role: 'system', content: buildSystemPrompt(emotion, guide, userName) },
      ...messages,
    ]

    if (messages.length === 0) {
      apiMessages.push({ role: 'user', content: '念念，我抽到了这张卡，想和你聊聊。' })
    }

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: apiMessages,
        temperature: 0.8,
        max_tokens: 320,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      return {
        error: data.message || data.error?.message || `AI 请求失败 (${res.status})`,
        code: data.code,
      }
    }

    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) return { error: 'AI 返回为空' }

    return { reply }
  } catch (err) {
    console.error('nianqi-chat error', err)
    return { error: err.message || '云函数内部错误' }
  }
}
